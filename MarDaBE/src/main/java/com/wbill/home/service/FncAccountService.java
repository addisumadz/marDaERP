package com.wbill.home.service;

import com.wbill.home.model.FncAccount;
import com.wbill.home.model.FncAccount.AccountType;
import com.wbill.home.model.FncAccount.NormalBalance;
import com.wbill.home.dto.FncAccountCreateDTO;
import com.wbill.home.repository.FncAccountRepository;
import com.wbill.home.repository.FncJournalEntryLineRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FncAccountService {

    @Autowired
    private FncAccountRepository accountRepository;

    @Autowired
    private FncJournalEntryLineRepository lineRepository;

    public List<FncAccount> getAllAccounts() {
        return accountRepository.findAllByOrderByAccountCodeAsc();
    }

    public List<FncAccount> getActiveAccounts() {
        return accountRepository.findByIsActive(true);
    }

    public List<FncAccount> getAccountTree() {
        return accountRepository.findByParentAccountIsNullAndIsActiveOrderByAccountCodeAsc(true);
    }

    public Page<FncAccount> getAccountsPaginated(boolean active, int page, int size) {
        return accountRepository.findByIsActive(active, PageRequest.of(page, size));
    }

    public Optional<FncAccount> getAccountById(int id) {
        return accountRepository.findById(id);
    }

    public List<FncAccount> getAccountsByType(AccountType type) {
        return accountRepository.findByAccountType(type);
    }

    public List<FncAccount> getPostableAccounts() {
        return accountRepository.findPostableAccounts();
    }

    public List<FncAccount> searchAccounts(String search) {
        return accountRepository.searchAccounts(search);
    }

    @Transactional
    public FncAccount createAccount(FncAccountCreateDTO dto, String username) {
        if (accountRepository.existsByAccountCode(dto.getAccountCode())) {
            throw new IllegalArgumentException("Account code '" + dto.getAccountCode() + "' already exists");
        }

        FncAccount account = new FncAccount();
        account.setAccountCode(dto.getAccountCode());
        account.setAccountName(dto.getAccountName());
        account.setAccountNameAm(dto.getAccountNameAm());
        account.setAccountType(AccountType.valueOf(dto.getAccountType()));
        account.setIsHeader(dto.getIsHeader());
        account.setDescription(dto.getDescription());
        account.setCreatedBy(username);
        account.setIsActive(true);

        // Auto-set normal balance based on account type
        AccountType type = account.getAccountType();
        if (type == AccountType.ASSET || type == AccountType.EXPENSE) {
            account.setNormalBalance(NormalBalance.DEBIT);
        } else {
            account.setNormalBalance(NormalBalance.CREDIT);
        }

        if (dto.getParentAccountId() != null) {
            FncAccount parent = accountRepository.findById(dto.getParentAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent account not found"));
            account.setParentAccount(parent);
        }

        return accountRepository.save(account);
    }

    @Transactional
    public FncAccount updateAccount(int id, FncAccountCreateDTO dto) {
        FncAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id));

        // Check if code is changed and already exists
        if (!account.getAccountCode().equals(dto.getAccountCode())
                && accountRepository.existsByAccountCode(dto.getAccountCode())) {
            throw new IllegalArgumentException("Account code '" + dto.getAccountCode() + "' already exists");
        }

        account.setAccountCode(dto.getAccountCode());
        account.setAccountName(dto.getAccountName());
        account.setAccountNameAm(dto.getAccountNameAm());
        account.setAccountType(AccountType.valueOf(dto.getAccountType()));
        account.setIsHeader(dto.getIsHeader());
        account.setDescription(dto.getDescription());

        AccountType type = account.getAccountType();
        if (type == AccountType.ASSET || type == AccountType.EXPENSE) {
            account.setNormalBalance(NormalBalance.DEBIT);
        } else {
            account.setNormalBalance(NormalBalance.CREDIT);
        }

        if (dto.getParentAccountId() != null) {
            FncAccount parent = accountRepository.findById(dto.getParentAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent account not found"));
            account.setParentAccount(parent);
        } else {
            account.setParentAccount(null);
        }

        return accountRepository.save(account);
    }

    @Transactional
    public FncAccount deactivateAccount(int id) {
        FncAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id));

        // Check if account has posted transactions
        List<?> lines = lineRepository.findPostedLinesByAccountId(id);
        if (!lines.isEmpty()) {
            throw new IllegalArgumentException("Cannot deactivate account with posted transactions");
        }

        account.setIsActive(false);
        return accountRepository.save(account);
    }

    @Transactional
    public FncAccount activateAccount(int id) {
        FncAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id));
        account.setIsActive(true);
        return accountRepository.save(account);
    }
}
