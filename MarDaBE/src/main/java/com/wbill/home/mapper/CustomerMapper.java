package com.wbill.home.mapper;

import org.springframework.beans.factory.annotation.Autowired;

import com.wbill.home.dto.BillingCustomerInfoDTO;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.AddressKetena;
import com.wbill.home.model.AddressStreets;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingMeterSize;
import com.wbill.home.model.BillingMeterType;
import com.wbill.home.model.BillingModeOfWaterService;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.AddressKetenaRepository;
import com.wbill.home.repository.AddressStreetsRepository;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingCustomerTypeRepository;
import com.wbill.home.repository.BillingMeterSizeRepository;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.BranchRepository;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.model.Branch;

/**
 * A utility class for mapping between BillingCustomerInfo entity and DTO.
 */
public class CustomerMapper {
	
	   @Autowired
	    private BillingCustomerInfoRepository billingCustomerInfoRepository;
	    @Autowired
	    private BillingReadingRepository billingReadingRepository;
	    
	  @Autowired
	  private UserAccountRepository userAccountRepository;
	  @Autowired
	  private BillingMeterSizeRepository billingMeterSizeRepository;
	  
	  @Autowired
	  private BillingCustomerTypeRepository billingCustomerTypeRepository;
	  
	  @Autowired
	  private BranchRepository branchRepository;
	  
	  @Autowired
	  private AddressStreetsRepository addressStreetsRepository;
	  
	  @Autowired
	  private AddressKetenaRepository addressKetenaRepository;

    /**
     * Maps a BillingCustomerInfo entity to a BillingCustomerInfoDTO.
     *
     * @param entity The BillingCustomerInfo entity.
     * @return The populated BillingCustomerInfoDTO.
     */
    public static BillingCustomerInfoDTO toDto(BillingCustomerInfo entity) {
        BillingCustomerInfoDTO dto = new BillingCustomerInfoDTO();

        // Basic Customer Info
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setFullNameEng(entity.getFullNameEng());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setNationalIdNumber(entity.getNationalIdNumber());
        dto.setAccountNumber(entity.getAccountNumber());
        dto.setHouseNumber(entity.getHouseNumber());
        dto.setMeterNumber(entity.getMeterNumber());
        dto.setStatus(entity.getStatus());
        dto.setCountNumber(entity.getCountNumber());
        
        // Financial & Meter Information
        dto.setCustomerBalanceBirr(entity.getCustomerBalanceBirr());
        dto.setInitialReading(entity.getInitialReading());
        dto.setInitialConsumption(entity.getInitialConsumption());
        dto.setMaxReference(entity.getMaxReference());
        dto.setAdditionalMonthlyPayment(entity.getAdditionalMonthlyPayment());
        dto.setTekemachKfya(entity.getTekemachKfya());
        dto.setTechemariKfya(entity.getTechemariKfya());
        dto.setPrepaidBirrCurrentBalance(entity.getPrepaidBirrCurrentBalance());
        dto.setTechemariFieldName(entity.getTechemariFieldName());

        // Arrears Information
        dto.setOldHasPenalty(entity.getOldHasPenalty());
        dto.setOldIfPenaltyPaid(entity.getOldIfPenaltyPaid());
        dto.setOldPenlityNumberOfMonths(entity.getOldPenlityNumberOfMonths());
        dto.setOldMonthsList(entity.getOldMonthsList());
        dto.setOldKfyaAndPenaltyTotal(entity.getOldKfyaAndPenaltyTotal());
        dto.setOldKfyaEachMonth(entity.getOldKfyaEachMonth());
        
        // Address & Locality Information
        dto.setAddressDescription(entity.getAddressDescription());
        dto.setCityId(entity.getCityId());
        dto.setZoneId(entity.getZoneId());
        if (entity.getAddressStreet() != null) {
            dto.setAddressStreetsId(entity.getAddressStreet().getId());
        }
        if (entity.getAddressKetena() != null) {
            dto.setAddressKetenaId(entity.getAddressKetena().getId());
        }
        if (entity.getBranch() != null) {
            dto.setBranchsId(entity.getBranch().getId());
        }
        
        // Document & Photo Information
        dto.setCustomerPhoto(entity.getCustomerPhoto());
        dto.setMetawokiaScanned(entity.getMetawokiaScanned());
        dto.setQrCode(entity.getQrCode());
        
        // Meter & Water Service Type Information
        if (entity.getBillingCustomerType() != null) {
            dto.setCustomerTypeId(entity.getBillingCustomerType().getId());
        }
        if (entity.getBillingMeterSize() != null) {
            dto.setMeterSizeId(entity.getBillingMeterSize().getId());
        }
        if (entity.getBillingMeterType() != null) {
            dto.setBillingMeterTypeId(entity.getBillingMeterType().getId());
        }
        if (entity.getBillingModeOfWaterService() != null) {
            dto.setBillingModeOfWaterServiceId(entity.getBillingModeOfWaterService().getId());
        }

        // Other Associations
        if (entity.getUserAccount() != null) {
            dto.setAssignedReaderId(entity.getUserAccount().getId());
        }
        if (entity.getBillingCustomerInfoMeter() != null) {
            dto.setBillingCustomerInfoMeterId(entity.getBillingCustomerInfoMeter().getId());
        }
        if (entity.getBillingTerminationReason() != null) {
            dto.setBillingTerminationReasonId(entity.getBillingTerminationReason().getId());
            dto.setTerminationReason(entity.getBillingTerminationReason().getTerminationReason());
        }

        // Date and Flags
        dto.setMeterLifeStart(entity.getMeterLifeStart());
        dto.setMeterLifeLimit(entity.getMeterLifeLimit());
        dto.setIsInitialized(entity.getIsInitialized());
        dto.setIsInitializedSecondTime(entity.getIsInitializedSecondTime());
        dto.setRegisteredDate(entity.getRegisteredDate());
        dto.setRegisteredYear(entity.getRegisteredYear());
        dto.setRegisteredMonth(entity.getRegisteredMonth());
        dto.setCanceledDate(entity.getCanceledDate());
        dto.setCanceledYear(entity.getCanceledYear());
        dto.setCanceledMonth(entity.getCanceledMonth());
        dto.setWasCanceled(entity.getWasCanceled());
        dto.setIsJustReturnFromPenality(entity.getIsJustReturnFromPenality());
        dto.setCanceledActivatedDate(entity.getCanceledActivatedDate());
        dto.setCompleteDeleted(entity.getCompleteDeleted());
        dto.setCompleteDeletedDate(entity.getCompleteDeletedDate());
        
        // Additional Fields
        dto.setTerminationRemark(entity.getTerminationRemark());
        dto.setLocationCoordination(entity.getLocationCoordination());
        dto.setKdmeKfyaReasons(entity.getKdmeKfyaReasons());

        return dto;
    }
    
    
    public static BillingCustomerInfo fromDto(
            BillingCustomerInfoDTO dto,
            // You would need to inject your repositories here to fetch entities
            // For example:
            // UserRepository userRepository,
            // BranchRepository branchRepository,
            // ... etc
            BillingCustomerInfo existingEntity) {
        
        // If updating an existing entity, use it. Otherwise, create a new one.
        BillingCustomerInfo entity = (existingEntity != null) ? existingEntity : new BillingCustomerInfo();

        // Basic Customer Info
        entity.setFullName(dto.getFullName());
        entity.setFullNameEng(dto.getFullNameEng());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setNationalIdNumber(dto.getNationalIdNumber());
        entity.setAccountNumber(dto.getAccountNumber());
        entity.setHouseNumber(dto.getHouseNumber());
        entity.setMeterNumber(dto.getMeterNumber());
        entity.setStatus(dto.getStatus());
        entity.setCountNumber(dto.getCountNumber());
        
        // Financial & Meter Information
        entity.setCustomerBalanceBirr(dto.getCustomerBalanceBirr());
        entity.setInitialReading(dto.getInitialReading());
        entity.setInitialConsumption(dto.getInitialConsumption());
        entity.setMaxReference(dto.getMaxReference());
        entity.setAdditionalMonthlyPayment(dto.getAdditionalMonthlyPayment());
        entity.setTekemachKfya(dto.getTekemachKfya());
        entity.setTechemariKfya(dto.getTechemariKfya());
        entity.setPrepaidBirrCurrentBalance(dto.getPrepaidBirrCurrentBalance());
        entity.setTechemariFieldName(dto.getTechemariFieldName());

        // Arrears Information
        entity.setOldHasPenalty(dto.isOldHasPenalty());
        entity.setOldIfPenaltyPaid(dto.isOldIfPenaltyPaid());
        entity.setOldPenlityNumberOfMonths(dto.getOldPenlityNumberOfMonths());
        entity.setOldMonthsList(dto.getOldMonthsList());
        entity.setOldKfyaAndPenaltyTotal(dto.getOldKfyaAndPenaltyTotal());
        entity.setOldKfyaEachMonth(dto.getOldKfyaEachMonth());
        
        // Address & Locality Information (fetching and setting nested entities)
        entity.setAddressDescription(dto.getAddressDescription());
        entity.setCityId(dto.getCityId());
        entity.setZoneId(dto.getZoneId());
        
        // Use null checks before fetching related entities
        if (dto.getAddressStreetsId() != null) {
//             AddressStreets street = addressStreetsRepository.findById(dto.getAddressStreetsId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid street ID"));
//             entity.setAddressStreet(street);
        }
        if (dto.getAddressKetenaId() != null) {
//             AddressKetena ketena = addressKetenaRepository.findById(dto.getAddressKetenaId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid ketena ID"));
//             entity.setAddressKetena(ketena);
        }
        if (dto.getBranchsId() != null) {
//             Branch branch = branchRepository.findById(dto.getBranchsId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid branch ID"));
//             entity.setBranch(branch);
        }
        
        // Document & Photo Information
        entity.setCustomerPhoto(dto.getCustomerPhoto());
        entity.setMetawokiaScanned(dto.getMetawokiaScanned());
        entity.setQrCode(dto.getQrCode());
        
        // Meter & Water Service Type Information
        if (dto.getCustomerTypeId() != null) {
//             BillingCustomerType customerType = customerTypeRepository.findById(dto.getCustomerTypeId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid customer type ID"));
//             entity.setBillingCustomerType(customerType);
        }
        if (dto.getMeterSizeId() != null) {
//             BillingMeterSize meterSize = meterSizeRepository.findById(dto.getMeterSizeId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid meter size ID"));
//             entity.setBillingMeterSize(meterSize);
        }
        if (dto.getBillingMeterTypeId() != null) {
//             BillingMeterType meterType = meterTypeRepository.findById(dto.getBillingMeterTypeId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid meter type ID"));
//             entity.setBillingMeterType(meterType);
        }
        if (dto.getBillingModeOfWaterServiceId() != null) {
//             BillingModeOfWaterService mode = modeRepository.findById(dto.getBillingModeOfWaterServiceId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid mode of water service ID"));
//             entity.setBillingModeOfWaterService(mode);
        }

        // Other Associations
        if (dto.getAssignedReaderId() != null) {
//             UserAccount user = userRepository.findById(dto.getAssignedReaderId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
//             entity.setUserAccount(user);
        }
        if (dto.getBillingCustomerInfoMeterId() != null) {
//             BillingCustomerInfoMeter infoMeter = infoMeterRepository.findById(dto.getBillingCustomerInfoMeterId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid billing customer info meter ID"));
//             entity.setBillingCustomerInfoMeter(infoMeter);
        }
        if (dto.getBillingTerminationReasonId() != null) {
//             BillingTerminationReason reason = reasonRepository.findById(dto.getBillingTerminationReasonId())
//                     .orElseThrow(() -> new IllegalArgumentException("Invalid termination reason ID"));
//             entity.setBillingTerminationReason(reason);
        }

        // Date and Flags
        entity.setMeterLifeStart(dto.getMeterLifeStart());
        entity.setMeterLifeLimit(dto.getMeterLifeLimit());
        entity.setIsInitialized(dto.isIsInitialized());
        entity.setIsInitializedSecondTime(dto.isIsInitializedSecondTime());
        entity.setRegisteredDate(dto.getRegisteredDate());
        entity.setRegisteredYear(dto.getRegisteredYear());
        entity.setRegisteredMonth(dto.getRegisteredMonth());
        entity.setCanceledDate(dto.getCanceledDate());
        entity.setCanceledYear(dto.getCanceledYear());
        entity.setCanceledMonth(dto.getCanceledMonth());
        entity.setWasCanceled(dto.isWasCanceled());
        entity.setIsJustReturnFromPenality(dto.isIsJustReturnFromPenality());
        entity.setCanceledActivatedDate(dto.getCanceledActivatedDate());
        entity.setCompleteDeleted(dto.getCompleteDeleted());
        entity.setCompleteDeletedDate(dto.getCompleteDeletedDate());

        // Additional Fields
        entity.setTerminationRemark(dto.getTerminationRemark());
        entity.setLocationCoordination(dto.getLocationCoordination());
        entity.setKdmeKfyaReasons(dto.getKdmeKfyaReasons());

        return entity;
    }
    
    /**
     * Maps a BillingCustomerInfoDTO to a BillingCustomerInfo entity.
     * This is used for creating or updating a customer.
     *
     * @param dto The BillingCustomerInfoDTO.
     * @return The populated BillingCustomerInfo entity.
     */
//    public static BillingCustomerInfo fromDto(
//            BillingCustomerInfoDTO dto,
//            // You would need to inject your repositories here to fetch entities
//            // For example:
//            // UserRepository userRepository,
//            // BranchRepository branchRepository,
//            // ... etc
//            BillingCustomerInfo existingEntity) {
//        
//        // If updating an existing entity, use it. Otherwise, create a new one.
//        BillingCustomerInfo entity = (existingEntity != null) ? existingEntity : new BillingCustomerInfo();
//
//        // Basic Customer Info
//        entity.setFullName(dto.getFullName());
//        entity.setFullNameEng(dto.getFullNameEng());
//        entity.setPhoneNumber(dto.getPhoneNumber());
//        entity.setNationalIdNumber(dto.getNationalIdNumber());
//        entity.setAccountNumber(dto.getAccountNumber());
//        entity.setHouseNumber(dto.getHouseNumber());
//        entity.setMeterNumber(dto.getMeterNumber());
//        entity.setStatus(dto.getStatus());
//        entity.setCountNumber(dto.getCountNumber());
//        
//        // Financial & Meter Information
//        entity.setCustomerBalanceBirr(dto.getCustomerBalanceBirr());
//        entity.setInitialReading(dto.getInitialReading());
//        // For Integer DTO fields, you might need to handle null values
//        entity.setInitialConsumption(dto.getInitialConsumption());
//        entity.setMaxReference(dto.getMaxReference());
//        entity.setAdditionalMonthlyPayment(dto.getAdditionalMonthlyPayment());
//        entity.setTekemachKfya(dto.getTekemachKfya());
//        entity.setTechemariKfya(dto.getTechemariKfya());
//        entity.setPrepaidBirrCurrentBalance(dto.getPrepaidBirrCurrentBalance());
//        entity.setTechemariFieldName(dto.getTechemariFieldName());
//
//        // Arrears Information
//        entity.setOldHasPenalty(dto.isOldHasPenalty());
//        entity.setOldIfPenaltyPaid(dto.isOldIfPenaltyPaid());
//        entity.setOldPenlityNumberOfMonths(dto.getOldPenlityNumberOfMonths());
//        entity.setOldMonthsList(dto.getOldMonthsList());
//        entity.setOldKfyaAndPenaltyTotal(dto.getOldKfyaAndPenaltyTotal());
//        entity.setOldKfyaEachMonth(dto.getOldKfyaEachMonth());
//        
//        // Address & Locality Information (fetching and setting nested entities)
//        entity.setAddressDescription(dto.getAddressDescription());
//        entity.setCityId(dto.getCityId());
//        entity.setZoneId(dto.getZoneId());
//        
//        // Example of how you would fetch and set a related entity
//        // if (dto.getAddressStreetsId() != null) {
//        //     AddressStreets street = addressStreetsRepository.findById(dto.getAddressStreetsId())
//        //             .orElseThrow(() -> new IllegalArgumentException("Invalid street ID"));
//        //     entity.setAddressStreet(street);
//        // }
//        // ... and so on for other fields like AddressKetena, Branch, etc.
//        
//        // Document & Photo Information
//        entity.setCustomerPhoto(dto.getCustomerPhoto());
//        entity.setMetawokiaScanned(dto.getMetawokiaScanned());
//        entity.setQrCode(dto.getQrCode());
//        
//        // Meter & Water Service Type Information
//        // ... Similar to the above, you would fetch and set entities here
//
//        // Other Associations
//        // ... Similar to the above, you would fetch and set entities here
//
//        // Date and Flags
//        entity.setMeterLifeStart(dto.getMeterLifeStart());
//        entity.setMeterLifeLimit(dto.getMeterLifeLimit());
//        entity.setIsInitialized(dto.isIsInitialized());
//        entity.setIsInitializedSecondTime(dto.isIsInitializedSecondTime());
//        entity.setRegisteredDate(dto.getRegisteredDate());
//        entity.setRegisteredYear(dto.getRegisteredYear());
//        entity.setRegisteredMonth(dto.getRegisteredMonth());
//        entity.setCanceledDate(dto.getCanceledDate());
//        entity.setCanceledYear(dto.getCanceledYear());
//        entity.setCanceledMonth(dto.getCanceledMonth());
//        entity.setWasCanceled(dto.isWasCanceled());
//        entity.setIsJustReturnFromPenality(dto.isIsJustReturnFromPenality());
//        entity.setCanceledActivatedDate(dto.getCanceledActivatedDate());
//        entity.setCompleteDeleted(dto.getCompleteDeleted());
//        entity.setCompleteDeletedDate(dto.getCompleteDeletedDate());
//
//        // Additional Fields
//        entity.setTerminationRemark(dto.getTerminationRemark());
//        entity.setLocationCoordination(dto.getLocationCoordination());
//        entity.setKdmeKfyaReasons(dto.getKdmeKfyaReasons());
//
//        return entity;
//    }



}
