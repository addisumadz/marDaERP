package com.wbill.home.dto;

public interface BillingDashboardSumProjection {
    Double getTotalConsumption(); // consumption

    Double getTotalWuzifConsumption(); // wuzifFjota

    Double getTotalAdditionalFees(); // techemariKfya + wuzifTechemariKfya

    Double getTotalDerekKoshasha(); // additionalHisab + wuzifDerekKoshasha

    Double getTotalWuzifAmount(); // wuzifHisab

    Double getTotalPenalty(); // kitat

    Double getTotalPrepaid(); // kecreditYetekefele

    Double getTotalPaid(); // tekilalaYetekefele

    Double getTotalExpected(); // tekilalaTekefay

    Long getTotalBillCount(); // count
}
