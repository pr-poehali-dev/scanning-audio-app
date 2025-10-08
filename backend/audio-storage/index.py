'''
Business: Cloud storage for audio files. Upload, download, list, and delete audio files.
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with audio file data
'''
import json
import base64
import hashlib
from typing import Dict, Any, Optional

# In-memory storage (для простоты - в продакшене используйте S3/DB)
# Формат: {user_id: {file_key: base64_data}}
AUDIO_STORAGE: Dict[str, Dict[str, str]] = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Get user ID from custom header
    headers = event.get('headers', {})
    user_id: str = headers.get('x-user-id', headers.get('X-User-Id', 'default'))
    
    # Initialize user storage if not exists
    if user_id not in AUDIO_STORAGE:
        AUDIO_STORAGE[user_id] = {}
    
    # GET - List all files or get specific file
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        file_key = params.get('key')
        
        if file_key:
            # Get specific file
            file_data = AUDIO_STORAGE[user_id].get(file_key)
            if file_data:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'key': file_key, 'data': file_data})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'File not found'})
                }
        else:
            # List all files
            files = {key: data for key, data in AUDIO_STORAGE[user_id].items()}
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'files': files, 'count': len(files)})
            }
    
    # POST - Upload new file
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        file_key: str = body_data.get('key', '')
        file_data: str = body_data.get('data', '')
        
        if not file_key or not file_data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Missing key or data'})
            }
        
        # Save file
        AUDIO_STORAGE[user_id][file_key] = file_data
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'key': file_key,
                'size': len(file_data)
            })
        }
    
    # DELETE - Delete file
    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        file_key = params.get('key')
        
        if not file_key:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Missing key parameter'})
            }
        
        if file_key in AUDIO_STORAGE[user_id]:
            del AUDIO_STORAGE[user_id][file_key]
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'deleted': file_key})
            }
        else:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'File not found'})
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }
