package com.wbill.home.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProgressService {
    // Track last logged 5% step per job to emit logs at 5,10,...,100
    private final Map<String, Integer> lastLoggedStep = new ConcurrentHashMap<>();
    // Store recent log lines per job (ring buffer behavior capped by maxLogsPerJob)
    private final Map<String, List<String>> logs = new ConcurrentHashMap<>();
    private static final int maxLogsPerJob = 1000;
    public static class ProgressInfo {
        private volatile int total;
        private volatile int processed;
        private volatile boolean done;
        private volatile String status; // e.g., RUNNING, DONE, ERROR
        private volatile String message; // last message or error

        public int getTotal() { return total; }
        public int getProcessed() { return processed; }
        public boolean isDone() { return done; }
        public String getStatus() { return status; }
        public String getMessage() { return message; }

        public void setTotal(int total) { this.total = total; }
        public void setProcessed(int processed) { this.processed = processed; }
        public void setDone(boolean done) { this.done = done; }
        public void setStatus(String status) { this.status = status; }
        public void setMessage(String message) { this.message = message; }

        public int getPercent() {
            int t = total;
            if (t <= 0) return 0;
            int p = (int)Math.floor((processed * 100.0) / t);
            if (p >= 100 && !done) return 99; // cap until done
            return Math.max(0, Math.min(100, p));
        }
    }

    private final Map<String, ProgressInfo> jobs = new ConcurrentHashMap<>();

    public String createJob(int total) {
        String jobId = UUID.randomUUID().toString();
        ProgressInfo info = new ProgressInfo();
        info.setTotal(Math.max(0, total));
        info.setProcessed(0);
        info.setDone(false);
        info.setStatus("RUNNING");
        info.setMessage("Starting");
        jobs.put(jobId, info);
        logs.put(jobId, new ArrayList<>());
        return jobId;
    }

    public void setTotal(String jobId, int total) {
        ProgressInfo info = jobs.get(jobId);
        if (info != null) info.setTotal(total);
    }

    public void incrementProcessed(String jobId) {
        ProgressInfo info = jobs.get(jobId);
        if (info != null) {
            info.setProcessed(info.getProcessed() + 1);
            logIfFivePercentStep(jobId, info);
        }
    }

    public void incrementProcessedBy(String jobId, int delta) {
        ProgressInfo info = jobs.get(jobId);
        if (info != null && delta > 0) {
            info.setProcessed(info.getProcessed() + delta);
            logIfFivePercentStep(jobId, info);
        }
    }

    public void updateMessage(String jobId, String msg) {
        ProgressInfo info = jobs.get(jobId);
        if (info != null) info.setMessage(msg);
    }

    public void markDone(String jobId, String msg) {
        ProgressInfo info = jobs.get(jobId);
        if (info != null) {
            info.setDone(true);
            info.setStatus("DONE");
            info.setMessage(msg);
            // Ensure we log the final 100% step
            System.out.println("[BillGen] job=" + jobId + " progress=100% (done) processed=" + info.getProcessed() + "/" + info.getTotal());
            lastLoggedStep.put(jobId, 100);
        }
    }

    public void markError(String jobId, String msg) {
        ProgressInfo info = jobs.get(jobId);
        if (info != null) {
            info.setDone(true);
            info.setStatus("ERROR");
            info.setMessage(msg);
        }
    }

    public ProgressInfo get(String jobId) {
        return jobs.get(jobId);
    }

    public void addLog(String jobId, String line) {
        if (line == null) return;
        List<String> list = logs.get(jobId);
        if (list == null) return;
        synchronized (list) {
            list.add(line);
            // cap logs to last maxLogsPerJob entries
            int extra = list.size() - maxLogsPerJob;
            if (extra > 0) {
                list.subList(0, extra).clear();
            }
        }
    }

    public List<String> getLogs(String jobId) {
        List<String> list = logs.get(jobId);
        if (list == null) return Collections.emptyList();
        synchronized (list) {
            return new ArrayList<>(list);
        }
    }

    public void cleanup(String jobId) {
        jobs.remove(jobId);
        lastLoggedStep.remove(jobId);
        logs.remove(jobId);
    }

    private void logIfFivePercentStep(String jobId, ProgressInfo info) {
        int percent = info.getPercent();
        // Snap to nearest lower 5% step
        int step = Math.max(0, (percent / 5) * 5);
        Integer last = lastLoggedStep.get(jobId);
        if (step >= 5 && (last == null || step > last)) {
            System.out.println("[BillGen] job=" + jobId + " progress=" + step + "% processed=" + info.getProcessed() + "/" + info.getTotal());
            lastLoggedStep.put(jobId, step);
        }
    }
}
