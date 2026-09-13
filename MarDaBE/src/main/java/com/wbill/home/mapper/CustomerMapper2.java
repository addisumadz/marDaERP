//package com.wbill.home.mapper;
//
//
//import com.wbill.home.dto.BillingCustomerInfoDTO;
//import com.wbill.home.dto.UserAccountDTO;
//import com.wbill.home.model.BillingCustomerInfo; // Your original entity
//import com.wbill.home.model.UserAccount;       // Your original entity
//
//public class CustomerMapper2 {
//
//    public static BillingCustomerInfoDTO toDto(BillingCustomerInfo customer) {
//        if (customer == null) {
//            return null;
//        }
//
//        BillingCustomerInfoDTO dto = new BillingCustomerInfoDTO();
//        
//        // --- Map direct fields ---
//        dto.setId(customer.getId());
//        dto.setFullName(customer.getFullName());
//        dto.setFullNameEng(customer.getFullNameEng());
//        dto.setAccountNumber(customer.getAccountNumber());
//        dto.setMeterNumber(customer.getMeterNumber());
//        dto.setStatus(customer.getStatus());
//
//        // --- Map nested objects safely ---
//        // This is the key part. We manually create the nested DTO.
//        if (customer.getUserAccount() != null) {
//            UserAccount userEntity = customer.getUserAccount();
//            UserAccountDTO userDto = new UserAccountDTO();
//            userDto.setId(userEntity.getId());
//            // Assuming your UserAccount entity has a getFullName() method
//            userDto.setFullName(userEntity.getFirstName()); 
//            
//            dto.setAssignedReader(userDto);
//        }
//
//        return dto;
//    }
//}