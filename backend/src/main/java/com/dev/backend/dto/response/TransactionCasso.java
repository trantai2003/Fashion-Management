package com.dev.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionCasso {
     Long id;
     String tid;
     String description;
     Double amount;
     Double cusumBalance;
     String when;
     String bookingDate;
     String bankSubAccId;
     String paymentChannel;
     String virtualAccount;
     String virtualAccountName;
     String corresponsiveName;
     String corresponsiveAccount;
     String corresponsiveBankId;
     String corresponsiveBankName;
     Long accountId;
     String bankCodeName;
}
