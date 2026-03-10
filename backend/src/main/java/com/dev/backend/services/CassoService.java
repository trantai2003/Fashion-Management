package com.dev.backend.services;

import com.dev.backend.dto.response.CassoResponse;

public interface CassoService {
    CassoResponse getListTransactionCasso(String fromDate, int page, int pageSize, String sort);
}
