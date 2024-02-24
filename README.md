# Secure and Decentralized Data Sharing for IPFS

## Introduction
The InterPlanetary File System (IPFS) has significantly transformed data storage and retrieval, offering decentralized solutions for managing data. However, a gap exists in its ability to support secure data sharing. This project introduces a novel scheme for secure, flexible, and decentralized data sharing in IPFS, leveraging blockchain technology and smart contracts.

## Architecture
架构图如下

![image.png](https://raw.githubusercontent.com/lenny-mo/PictureUploadFolder/main/20240224175234.png)



## Key Features
- **Decentralized File Systems**: Utilizes IPFS for decentralized data storage.
- **Blockchain Integration**: Employs smart contracts for secure data transactions.
- **Secure Data Sharing**: Ensures data confidentiality using symmetric encryption and proxy re-encryption (PRE).
- **Flexibility**: Provides flexible data sharing capabilities, enabling data owners to control access.
- **Cost-Effective**: Designed to be economically viable within blockchain environments.

## System Overview
- **Encryption**: Data is encrypted by the data owner using symmetric encryption.
- **Capsule Creation**: Symmetric keys are capsuled using the data owner's public key.
- **File Storing Contract**: Encrypted data is uploaded to IPFS, and the CID and capsuled key are stored in the blockchain ledger.
- **Re-Capsule Contract**: Enables data sharing through re-encryption keys and computation of re-capsuled symmetric keys.

## Installation and Usage
*Instructions on how to set up and use the system in a local development environment.*

## Testing
Conducted in the Polygon test network Mumbai, our tests validate the performance and efficiency of the system. The results demonstrate the achievement of our goals - confidentiality, flexibility, and decentralization, at an affordable cost.

## Contributing
We welcome contributions from the community. Please read our contributing guidelines before submitting your pull requests.

## References
- [Interplanetary File System (IPFS)](https://ipfs.io/)
- [Polygon Test Network Mumbai](https://mumbai.polygonscan.com/)
- *Additional relevant references*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed as part of research on decentralized data sharing systems. For more details, refer to the accompanying research paper.

