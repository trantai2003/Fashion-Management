package com.dev.backend.constant.variables;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ConstantVariables {
    public static String SIGNER_KEY;
    public static String SUPPLIER_MAIL_LOGIN_HREF;

    @Value("${constant.key.signer-key}")
    public void setSignerKey(String signerKey) {
        SIGNER_KEY = signerKey;
    }

    @Value("${supplier.mail.login-href}")
    public void setSupplierMailLoginHref(String supplierMailLoginHref){
        SUPPLIER_MAIL_LOGIN_HREF = supplierMailLoginHref;
    }
}
