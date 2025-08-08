'use client'

import {
  Client,
  FileCreateTransaction,
  FileAppendTransaction,
  FileInfoQuery,
  FileContentsQuery,
  FileDeleteTransaction,
  FileId,
  AccountId,
  PrivateKey,
  Hbar
} from '@hashgraph/sdk'

// File types for document management
interface DocumentMetadata {
  fileName: string
  fileType: 'INVOICE' | 'CONTRACT' | 'CERTIFICATE' | 'REPORT' | 'COMPLIANCE'
  uploadedBy: string
  uploadedAt: number
  size: number
  hash: string
  region: string
  invoiceId?: string
  encrypted: boolean
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED'
}

interface StoredDocument {
  fileId: string
  metadata: DocumentMetadata
  content?: Uint8Array
  url?: string
}

interface FileStorageStats {
  totalFiles: number
  totalSize: number
  filesByType: Record<string, number>
  filesByRegion: Record<string, number>
  storageUsed: string
}

export class HederaFileService {
  private client: Client
  private operatorId: AccountId
  private operatorKey: PrivateKey
  private documentRegistry: Map<string, DocumentMetadata> = new Map()
  private maxFileSize = 1024 * 1024 // 1MB limit for HFS

  constructor() {
    // Initialize Hedera client for testnet
    this.client = Client.forTestnet()
    
    // Set operator (in production, use environment variables)
    this.operatorId = AccountId.fromString(process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || '0.0.123456')
    this.operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY || '302e020100300506032b657004220420...')
    
    this.client.setOperator(this.operatorId, this.operatorKey)
  }

  async uploadDocument(
    content: Uint8Array | string,
    metadata: Omit<DocumentMetadata, 'uploadedAt' | 'size' | 'hash'>
  ): Promise<StoredDocument> {
    try {
      // Convert string to Uint8Array if needed
      const fileContent = typeof content === 'string' ? 
        new TextEncoder().encode(content) : content

      // Check file size limit
      if (fileContent.length > this.maxFileSize) {
        throw new Error(`File size exceeds limit of ${this.maxFileSize} bytes`)
      }

      // Generate file hash
      const hash = await this.generateFileHash(fileContent)

      // Create file metadata
      const completeMetadata: DocumentMetadata = {
        ...metadata,
        uploadedAt: Date.now(),
        size: fileContent.length,
        hash
      }

      // Create file on Hedera File Service
      const fileCreateTx = new FileCreateTransaction()
        .setContents(fileContent)
        .setKeys([this.operatorKey.publicKey])
        .setFileMemo(`${metadata.fileType}:${metadata.fileName}`)
        .setMaxTransactionFee(new Hbar(2))

      const fileCreateResponse = await fileCreateTx.execute(this.client)
      const fileCreateReceipt = await fileCreateResponse.getReceipt(this.client)
      
      const fileId = fileCreateReceipt.fileId
      if (!fileId) {
        throw new Error('Failed to create file on HFS')
      }

      // Store metadata in registry
      this.documentRegistry.set(fileId.toString(), completeMetadata)

      console.log(`Document uploaded to HFS: ${fileId.toString()}`)
      
      return {
        fileId: fileId.toString(),
        metadata: completeMetadata,
        content: fileContent
      }
    } catch (error) {
      console.error('Error uploading document to HFS:', error)
      throw error
    }
  }

  async downloadDocument(fileId: string): Promise<StoredDocument | null> {
    try {
      const fileIdObj = FileId.fromString(fileId)
      
      // Get file contents
      const fileContentsQuery = new FileContentsQuery()
        .setFileId(fileIdObj)

      const fileContents = await fileContentsQuery.execute(this.client)
      
      // Get file info
      const fileInfoQuery = new FileInfoQuery()
        .setFileId(fileIdObj)

      const fileInfo = await fileInfoQuery.execute(this.client)
      
      // Get metadata from registry or create basic metadata
      let metadata = this.documentRegistry.get(fileId)
      if (!metadata) {
        metadata = {
          fileName: fileInfo.fileMemo || 'unknown',
          fileType: 'INVOICE',
          uploadedBy: 'unknown',
          uploadedAt: Date.now(),
          size: fileContents.length,
          hash: await this.generateFileHash(fileContents),
          region: 'UNKNOWN',
          encrypted: false,
          accessLevel: 'PRIVATE'
        }
      }

      return {
        fileId,
        metadata,
        content: fileContents
      }
    } catch (error) {
      console.error('Error downloading document from HFS:', error)
      return null
    }
  }

  async appendToDocument(fileId: string, additionalContent: Uint8Array | string): Promise<boolean> {
    try {
      const fileIdObj = FileId.fromString(fileId)
      const content = typeof additionalContent === 'string' ? 
        new TextEncoder().encode(additionalContent) : additionalContent

      const fileAppendTx = new FileAppendTransaction()
        .setFileId(fileIdObj)
        .setContents(content)
        .setMaxTransactionFee(new Hbar(2))

      const fileAppendResponse = await fileAppendTx.execute(this.client)
      const fileAppendReceipt = await fileAppendResponse.getReceipt(this.client)
      
      // Update metadata if exists
      const metadata = this.documentRegistry.get(fileId)
      if (metadata) {
        metadata.size += content.length
        metadata.uploadedAt = Date.now() // Update timestamp
        this.documentRegistry.set(fileId, metadata)
      }

      console.log(`Content appended to file: ${fileId}`)
      return true
    } catch (error) {
      console.error('Error appending to document:', error)
      return false
    }
  }

  async deleteDocument(fileId: string): Promise<boolean> {
    try {
      const fileIdObj = FileId.fromString(fileId)
      
      const fileDeleteTx = new FileDeleteTransaction()
        .setFileId(fileIdObj)
        .setMaxTransactionFee(new Hbar(1))

      const fileDeleteResponse = await fileDeleteTx.execute(this.client)
      const fileDeleteReceipt = await fileDeleteResponse.getReceipt(this.client)
      
      // Remove from registry
      this.documentRegistry.delete(fileId)
      
      console.log(`Document deleted from HFS: ${fileId}`)
      return true
    } catch (error) {
      console.error('Error deleting document from HFS:', error)
      return false
    }
  }

  async getDocumentInfo(fileId: string): Promise<DocumentMetadata | null> {
    try {
      // First check registry
      const registryMetadata = this.documentRegistry.get(fileId)
      if (registryMetadata) {
        return registryMetadata
      }

      // Query HFS for file info
      const fileIdObj = FileId.fromString(fileId)
      const fileInfoQuery = new FileInfoQuery()
        .setFileId(fileIdObj)

      const fileInfo = await fileInfoQuery.execute(this.client)
      
      // Create basic metadata from HFS info
      const metadata: DocumentMetadata = {
        fileName: fileInfo.fileMemo || 'unknown',
        fileType: 'INVOICE',
        uploadedBy: fileInfo.keys?.[0]?.toString() || 'unknown',
        uploadedAt: Date.now(),
        size: fileInfo.size.toNumber(),
        hash: 'unknown',
        region: 'UNKNOWN',
        encrypted: false,
        accessLevel: 'PRIVATE'
      }

      return metadata
    } catch (error) {
      console.error('Error getting document info:', error)
      return null
    }
  }

  async uploadInvoiceDocument(
    invoiceId: string,
    documentContent: string | Uint8Array,
    fileName: string,
    region: string = 'APAC'
  ): Promise<StoredDocument> {
    const metadata: Omit<DocumentMetadata, 'uploadedAt' | 'size' | 'hash'> = {
      fileName,
      fileType: 'INVOICE',
      uploadedBy: this.operatorId.toString(),
      region,
      invoiceId,
      encrypted: false,
      accessLevel: 'PRIVATE'
    }

    return await this.uploadDocument(documentContent, metadata)
  }

  async uploadComplianceDocument(
    documentContent: string | Uint8Array,
    fileName: string,
    region: string = 'APAC'
  ): Promise<StoredDocument> {
    const metadata: Omit<DocumentMetadata, 'uploadedAt' | 'size' | 'hash'> = {
      fileName,
      fileType: 'COMPLIANCE',
      uploadedBy: this.operatorId.toString(),
      region,
      encrypted: true,
      accessLevel: 'RESTRICTED'
    }

    return await this.uploadDocument(documentContent, metadata)
  }

  async getDocumentsByInvoice(invoiceId: string): Promise<StoredDocument[]> {
    const documents: StoredDocument[] = []
    
    for (const [fileId, metadata] of this.documentRegistry.entries()) {
      if (metadata.invoiceId === invoiceId) {
        const document = await this.downloadDocument(fileId)
        if (document) {
          documents.push(document)
        }
      }
    }
    
    return documents
  }

  async getDocumentsByType(fileType: DocumentMetadata['fileType']): Promise<StoredDocument[]> {
    const documents: StoredDocument[] = []
    
    for (const [fileId, metadata] of this.documentRegistry.entries()) {
      if (metadata.fileType === fileType) {
        const document = await this.downloadDocument(fileId)
        if (document) {
          documents.push(document)
        }
      }
    }
    
    return documents
  }

  async getDocumentsByRegion(region: string): Promise<StoredDocument[]> {
    const documents: StoredDocument[] = []
    
    for (const [fileId, metadata] of this.documentRegistry.entries()) {
      if (metadata.region === region) {
        const document = await this.downloadDocument(fileId)
        if (document) {
          documents.push(document)
        }
      }
    }
    
    return documents
  }

  getStorageStats(): FileStorageStats {
    const stats: FileStorageStats = {
      totalFiles: this.documentRegistry.size,
      totalSize: 0,
      filesByType: {},
      filesByRegion: {},
      storageUsed: '0 MB'
    }

    for (const metadata of this.documentRegistry.values()) {
      stats.totalSize += metadata.size
      
      // Count by type
      stats.filesByType[metadata.fileType] = (stats.filesByType[metadata.fileType] || 0) + 1
      
      // Count by region
      stats.filesByRegion[metadata.region] = (stats.filesByRegion[metadata.region] || 0) + 1
    }

    stats.storageUsed = `${(stats.totalSize / (1024 * 1024)).toFixed(2)} MB`
    
    return stats
  }

  async verifyDocumentIntegrity(fileId: string): Promise<boolean> {
    try {
      const document = await this.downloadDocument(fileId)
      if (!document || !document.content) {
        return false
      }

      const currentHash = await this.generateFileHash(document.content)
      return currentHash === document.metadata.hash
    } catch (error) {
      console.error('Error verifying document integrity:', error)
      return false
    }
  }

  private async generateFileHash(content: Uint8Array): Promise<string> {
    // Simple hash generation for demonstration
    // In production, use proper cryptographic hashing (SHA-256)
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content[i]
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  // Utility methods
  getAllDocuments(): DocumentMetadata[] {
    return Array.from(this.documentRegistry.values())
  }

  getDocumentCount(): number {
    return this.documentRegistry.size
  }

  getTotalStorageUsed(): number {
    let total = 0
    for (const metadata of this.documentRegistry.values()) {
      total += metadata.size
    }
    return total
  }

  // Mock methods for demo purposes
  async createInvoicePDF(invoiceData: any): Promise<StoredDocument> {
    const pdfContent = this.generateMockPDF(invoiceData)
    return await this.uploadInvoiceDocument(
      invoiceData.id,
      pdfContent,
      `invoice-${invoiceData.id}.pdf`,
      invoiceData.region || 'APAC'
    )
  }

  private generateMockPDF(invoiceData: any): string {
    // Mock PDF content generation
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Invoice: ${invoiceData.id}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`
  }
}

// Export singleton instance
export const hfsService = new HederaFileService()

// Export types for use in other files
export type { DocumentMetadata, StoredDocument, FileStorageStats }