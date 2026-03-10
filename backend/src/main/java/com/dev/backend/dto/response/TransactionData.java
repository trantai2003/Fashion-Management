package com.dev.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionData {
     int page;
     int pageSize;
     int nextPage;
     int prevPage;
     int totalPages;
     int totalRecords;
     List<TransactionCasso> records;
}
