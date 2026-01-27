package com.dev.backend.controller;

import com.dev.backend.dto.response.ResponseData;
import com.dev.backend.dto.response.entities.SizeDto;
import com.dev.backend.mapper.SizeMapper;
import com.dev.backend.services.impl.entities.SizeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/size")
public class SizeController {

    @Autowired
    private SizeService sizeService;

    @Autowired
    private SizeMapper sizeMapper;


    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<SizeDto>>> getAll() {
        return ResponseEntity.ok(
                ResponseData.<List<SizeDto>>builder()
                        .status(HttpStatus.OK.value())
                        .data(sizeMapper.toDtoList(sizeService.getAll()))
                        .build()
        );
    }

}
