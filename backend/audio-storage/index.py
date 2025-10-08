'''
Business: Cloud storage for audio files using PostgreSQL. Upload, download, list, and delete audio files.
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with audio file data
'''
import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Get origin for CORS
    headers = event.get('headers', {})
    origin = headers.get('origin', headers.get('Origin', '*'))
    
    # CORS headers to use in all responses
    cors_headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
    }
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'isBase64Encoded': False,
            'body': ''
        }
    
    # Get user ID from custom header
    user_id: str = headers.get('x-user-id', headers.get('X-User-Id', 'default'))
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # GET - List all files or get specific file
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            file_key = params.get('key')
            
            if file_key:
                # Get specific file
                cur.execute(
                    "SELECT file_key, file_data FROM t_p72229687_scanning_audio_app.audio_files WHERE user_id = %s AND file_key = %s",
                    (user_id, file_key)
                )
                row = cur.fetchone()
                
                if row:
                    return {
                        'statusCode': 200,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'key': row['file_key'], 'data': row['file_data']})
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'File not found'})
                    }
            else:
                # List all files (return keys and data)
                cur.execute(
                    "SELECT file_key, file_data FROM t_p72229687_scanning_audio_app.audio_files WHERE user_id = %s",
                    (user_id,)
                )
                rows = cur.fetchall()
                files = {row['file_key']: row['file_data'] for row in rows}
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'files': files, 'count': len(files)})
                }
        
        # POST - Upload new file (upsert)
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            file_key: str = body_data.get('key', '')
            file_data: str = body_data.get('data', '')
            
            if not file_key or not file_data:
                return {
                    'statusCode': 400,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Missing key or data'})
                }
            
            # Determine file_type based on key prefix
            if file_key.startswith('cell'):
                file_type = 'cell'
                cell_number = file_key.replace('cell_', '').replace('cell-', '')
            elif file_key.startswith('count'):
                file_type = 'count'
                cell_number = None
            else:
                file_type = 'system'
                cell_number = None
            
            # Upsert file (insert or update if exists)
            cur.execute("""
                INSERT INTO t_p72229687_scanning_audio_app.audio_files 
                    (user_id, file_key, file_data, file_type, file_name, cell_number, created_at, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), TRUE)
                ON CONFLICT (user_id, file_key) 
                DO UPDATE SET file_data = EXCLUDED.file_data, created_at = NOW()
            """, (user_id, file_key, file_data, file_type, f"{file_key}.mp3", cell_number))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
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
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Missing key parameter'})
                }
            
            cur.execute(
                "DELETE FROM t_p72229687_scanning_audio_app.audio_files WHERE user_id = %s AND file_key = %s",
                (user_id, file_key)
            )
            deleted_count = cur.rowcount
            conn.commit()
            
            if deleted_count > 0:
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'deleted': file_key})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'File not found'})
                }
        
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    finally:
        cur.close()
        conn.close()