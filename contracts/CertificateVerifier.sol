// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateVerifier {
    struct Certificate {
        address issuer;
        uint256 issuedAt;
        bool revoked;
        bool exists;
    }

    mapping(bytes32 => Certificate) private certificates;

    event CertificateRegistered(bytes32 indexed hash, address indexed issuer, uint256 issuedAt);
    event CertificateRevoked(bytes32 indexed hash, address indexed revoker);

    function registerCertificate(bytes32 hash) public {
        require(!certificates[hash].exists, "Certificate already registered");
        certificates[hash] = Certificate({
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false,
            exists: true
        });
        emit CertificateRegistered(hash, msg.sender, block.timestamp);
    }

    function revokeCertificate(bytes32 hash) public {
        require(certificates[hash].exists, "Certificate not found");
        require(certificates[hash].issuer == msg.sender, "Not the issuer");
        require(!certificates[hash].revoked, "Already revoked");
        certificates[hash].revoked = true;
        emit CertificateRevoked(hash, msg.sender);
    }

    function getCertificate(bytes32 hash)
        public
        view
        returns (bool exists, address issuer, uint256 issuedAt, bool revoked)
    {
        Certificate memory cert = certificates[hash];
        return (cert.exists, cert.issuer, cert.issuedAt, cert.revoked);
    }

    function verifyCertificate(bytes32 hash) public view returns (bool) {
        return certificates[hash].exists && !certificates[hash].revoked;
    }
}
