package com.dev.backend.controller;

import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.MauSacDto;
import com.dev.backend.mapper.MauSacMapper;
import com.dev.backend.services.impl.entities.MauSacService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mau-sac")
public class MauSacController {

    @Autowired
    private MauSacService mauSacService;

    @Autowired
    private MauSacMapper mauSacMapper;

    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<MauSacDto>>> getAll() {
        return ResponseEntity.ok(
                ResponseData.<List<MauSacDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(mauSacMapper.toDtoList(mauSacService.getAll()))
                        .build()
        );
    }

}
