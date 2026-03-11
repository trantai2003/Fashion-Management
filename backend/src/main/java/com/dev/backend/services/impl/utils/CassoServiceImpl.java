package com.dev.backend.services.impl.utils;

import com.dev.backend.dto.response.CassoResponse;
import com.dev.backend.exception.customize.CommonException;
import com.dev.backend.services.CassoService;
import com.nimbusds.jose.shaded.gson.Gson;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Slf4j
@Service
public class CassoServiceImpl implements CassoService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final Gson gson = new Gson();

    private static final String BASE_URL = "https://oauth.casso.vn/v2/transactions";
    private static final String API_KEY = "AK_CS.876702f01be211f1a3ca79c2f1d864cb.t6f1lQ8X7nX8E5dYIkmwenzuaDKvtGCdMLgCvgsJ0uTFE6c8xc2ZvV36KigsSVWV3Fng2XeZ";
    @Override
    public CassoResponse getListTransactionCasso(String fromDate, int page, int pageSize, String sort) {
        if(sort == null) sort = "ASC";

        String url = String.format("%s?fromDate=%s&page=%d&pageSize=%d&sort=%s",
                BASE_URL, fromDate, page, pageSize, sort);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Apikey " + API_KEY)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            //Kiểm tra status code có thành công hay không
            System.out.println(response.body());
            if(!(response.statusCode()+"").startsWith("2")) {
                throw new CommonException("Lỗi trong khi check lịch sử giao dịch");
            }

            return gson.fromJson(response.body(), CassoResponse.class);
        } catch (Exception e) {
            log.error("Error fetching data from Casso API: {}", e.getMessage());
            throw new CommonException("Lỗi trong khi check lịch sử giao dịch: "+e.getMessage());
        }
    }
}
