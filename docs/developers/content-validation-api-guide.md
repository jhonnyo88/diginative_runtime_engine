# Content Validation API Integration Guide

**Roadmap Reference:** Q1-AO-Milestone-1.2  
**Status:** Implemented  
**Business Impact:** <30 seconds validation feedback for DevTeam

## Overview

The Content Validation API provides real-time validation for AI-generated game content, ensuring >95% autonomous deployment rate by catching errors before they reach production.

## Features

### 1. REST API Validation
- Single content validation
- Batch validation for multiple items
- Caching for repeated validations
- Smart error suggestions

### 2. WebSocket Real-time Validation
- Instant feedback during content creation
- Incremental validation while typing
- Preview updates on successful validation
- <3 second response time

### 3. Performance Optimization
- Content hash-based caching (1 hour TTL)
- Parallel batch processing
- Rate limiting (10 validations/second)
- Automatic cache cleanup

## API Endpoints

### POST /api/validation/content
Validate a single content item.

**Request:**
```json
{
  "content": {
    "title": "GDPR Training Module",
    "description": "Municipal GDPR compliance training",
    "scenes": [...]
  },
  "contentType": "game", // or "scene", "quiz", "dialogue"
  "userId": "devteam-user-123",
  "teamId": "malmo-stad-team"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "path": "scenes[0].duration",
      "message": "Scene duration not specified",
      "type": "best_practice"
    }
  ],
  "processingTime": 45,
  "validationId": "val_1642789456123",
  "suggestions": [
    "Consider adding duration to improve user experience"
  ],
  "cached": false
}
```

### POST /api/validation/batch
Validate multiple content items in parallel.

**Request:**
```json
{
  "items": [
    { "content": {...}, "contentType": "game" },
    { "content": {...}, "contentType": "quiz" },
    { "content": {...}, "contentType": "dialogue" }
  ]
}
```

**Response:**
```json
{
  "results": [
    { "valid": true, "errors": [], "warnings": [], ... },
    { "valid": false, "errors": [...], "warnings": [], ... },
    { "valid": true, "errors": [], "warnings": [...], ... }
  ],
  "totalProcessingTime": 125
}
```

### GET /api/validation/health
Check validation service health.

**Response:**
```json
{
  "status": "healthy",
  "validationWorking": true,
  "processingTime": 12,
  "cacheSize": 245,
  "timestamp": "2025-01-18T12:45:00Z"
}
```

## WebSocket Integration

### Connection
```javascript
const socket = io('wss://api.diginativa.com', {
  auth: {
    token: 'jwt-token-here'
  }
});

// Authenticate
socket.emit('auth', {
  userId: 'devteam-user-123',
  teamId: 'malmo-stad-team'
});
```

### Real-time Validation
```javascript
// Send content for validation
socket.emit('validate', {
  content: gameManifest,
  contentType: 'game'
});

// Receive validation result
socket.on('validation-result', (result) => {
  console.log('Valid:', result.valid);
  console.log('Errors:', result.errors);
  console.log('Suggestions:', result.suggestions);
  
  // Update UI with errors
  result.errors.forEach(error => {
    highlightError(error.line, error.message);
  });
});

// Preview updates on successful validation
socket.on('preview-update', (data) => {
  updatePreviewPane(data.content);
});
```

### Incremental Validation
```javascript
// Validate while typing
editor.on('change', (content, cursorPos) => {
  socket.emit('validate-incremental', {
    content: content,
    contentType: 'game',
    cursorPosition: cursorPos,
    partial: true
  });
});

socket.on('validation-incremental', (result) => {
  // Show inline errors
  showInlineErrors(result.errors);
});
```

## Error Types and Suggestions

### Missing Fields
```json
{
  "path": "title",
  "message": "Title is required",
  "type": "missing",
  "suggestion": "Add a title field to your content"
}
```

### Type Errors
```json
{
  "path": "duration",
  "message": "Duration must be a number",
  "type": "invalid_type",
  "suggestion": "Duration should be a number in seconds"
}
```

### Structure Errors
```json
{
  "path": "scenes",
  "message": "At least one scene is required",
  "type": "structure",
  "suggestion": "Include at least one scene in your game manifest"
}
```

## Performance Metrics

The validation service tracks:
- `validation_processing_time` - Time to validate content
- `validation_error_count` - Number of errors found
- `validation_cache_hit` - Cache utilization
- `websocket_validation_time` - Real-time validation speed
- `batch_validation_size` - Batch processing metrics

## Integration Example

### Express Server Setup
```javascript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import validationRoutes from './api/routes/validation';
import { WebSocketValidationService } from './api/websocket-validation';

const app = express();
const server = createServer(app);
const io = new Server(server);

// REST API routes
app.use('/api/validation', validationRoutes);

// WebSocket validation
new WebSocketValidationService(io);

server.listen(3000);
```

### Client Integration
```javascript
// DevTeam Editor Component
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

function DevTeamEditor() {
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
    const socket = io('wss://api.diginativa.com');
    
    socket.on('validation-result', (result) => {
      setErrors(result.errors);
      setSuggestions(result.suggestions);
    });
    
    return () => socket.disconnect();
  }, []);
  
  const validateContent = async () => {
    const response = await fetch('/api/validation/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: JSON.parse(content),
        contentType: 'game'
      })
    });
    
    const result = await response.json();
    setErrors(result.errors);
    setSuggestions(result.suggestions);
  };
  
  return (
    <div>
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={validateContent}>Validate</button>
      {errors.map(error => (
        <div key={error.path} className="error">
          {error.path}: {error.message}
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Use WebSocket for Real-time Feedback**
   - Provides instant validation during content creation
   - Reduces friction in DevTeam workflow

2. **Batch Validation for Multiple Items**
   - Process multiple content items in parallel
   - Reduces API calls and improves performance

3. **Monitor Cache Hit Rates**
   - High cache hit rates indicate efficient content reuse
   - Adjust TTL based on content update frequency

4. **Handle Rate Limiting Gracefully**
   - Implement exponential backoff
   - Show user-friendly messages during rate limiting

5. **Use Suggestions for Self-Service**
   - Reduces support tickets
   - Helps DevTeam learn content structure

## Troubleshooting

### Validation Taking Too Long
- Check content size (large content may take longer)
- Monitor network latency
- Verify cache is working properly

### WebSocket Connection Issues
- Ensure authentication token is valid
- Check firewall/proxy settings
- Verify WebSocket protocol support

### Cache Not Working
- Check Redis connection
- Verify content hash generation
- Monitor cache eviction rates

## Future Enhancements

1. **AI-Powered Suggestions**
   - ML model for better error suggestions
   - Content quality recommendations

2. **Visual Validation**
   - Preview rendering validation
   - Layout consistency checks

3. **Multi-language Support**
   - Validation for Swedish, German, French, Dutch
   - Cultural appropriateness checks

4. **Performance Optimization**
   - GPU-accelerated validation for complex content
   - Distributed validation across regions