package com.dev.backend.controller;

import com.dev.backend.services.impl.entities.SanPhamQuanAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/v1/san-pham-quan-ao")
public class SanPhamQuanAoController {

    @Autowired
    private SanPhamQuanAoService sanPhamQuanAoService;

}
