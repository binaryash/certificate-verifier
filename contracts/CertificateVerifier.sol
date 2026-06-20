// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateVerifier {
    mapping(bytes32 => bool) private certificates;

    function registerCertificate(bytes32 hash) public {
        certificates[hash] = true;
    }

    function verifyCertificate(bytes32 hash)
        public
        view
        returns (bool)
    {
        return certificates[hash];
    }
}
