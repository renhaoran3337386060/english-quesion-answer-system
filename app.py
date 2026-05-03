"""
英语练习工具 - 后端API
完整版：题库管理 + 练习记录 + 三种题型
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import json
from datetime import datetime
import re

app = Flask(__name__, static_folder='static')
CORS(app)

DATABASE = 'english_practice.db'


def get_db():
    """获取数据库连接"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """初始化数据库"""
    conn = get_db()
    cursor = conn.cursor()
    
    # 题库表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS question_banks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,  -- translation, fillblank, synonym
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 题目表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bank_id INTEGER NOT NULL,
            content TEXT NOT NULL,  -- JSON格式存储题目内容
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE
        )
    ''')
    
    # 练习记录表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS practice_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bank_id INTEGER NOT NULL,
            question_id INTEGER,
            type TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            total INTEGER DEFAULT 0,
            details TEXT,  -- JSON格式存储详细记录
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()


# ==================== 题库管理API ====================

@app.route('/api/banks', methods=['GET'])
def get_banks():
    """获取所有题库"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT b.*, COUNT(q.id) as question_count
        FROM question_banks b
        LEFT JOIN questions q ON b.id = q.bank_id
        GROUP BY b.id
        ORDER BY b.updated_at DESC
    ''')
    banks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'data': banks})


@app.route('/api/banks', methods=['POST'])
def create_bank():
    """创建题库"""
    data = request.get_json()
    name = data.get('name', '').strip()
    qtype = data.get('type', '').strip()
    description = data.get('description', '').strip()
    
    if not name or not qtype:
        return jsonify({'success': False, 'message': '题库名称和类型不能为空'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO question_banks (name, type, description, updated_at) VALUES (?, ?, ?, ?)',
        (name, qtype, description, datetime.now())
    )
    bank_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'data': {'id': bank_id}})


@app.route('/api/banks/<int:bank_id>', methods=['PUT'])
def update_bank(bank_id):
    """更新题库"""
    data = request.get_json()
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE question_banks SET name = ?, description = ?, updated_at = ? WHERE id = ?',
        (name, description, datetime.now(), bank_id)
    )
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})


@app.route('/api/banks/<int:bank_id>', methods=['DELETE'])
def delete_bank(bank_id):
    """删除题库"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM question_banks WHERE id = ?', (bank_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})


# ==================== 题目管理API ====================

@app.route('/api/banks/<int:bank_id>/questions', methods=['GET'])
def get_questions(bank_id):
    """获取题库中的所有题目"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM questions WHERE bank_id = ?', (bank_id,))
    questions = []
    for row in cursor.fetchall():
        q = dict(row)
        q['content'] = json.loads(q['content'])
        questions.append(q)
    conn.close()
    return jsonify({'success': True, 'data': questions})


@app.route('/api/banks/<int:bank_id>/questions', methods=['POST'])
def add_question(bank_id):
    """添加题目"""
    data = request.get_json()
    content = json.dumps(data.get('content', {}), ensure_ascii=False)
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO questions (bank_id, content) VALUES (?, ?)',
        (bank_id, content)
    )
    question_id = cursor.lastrowid
    
    # 更新题库时间
    cursor.execute(
        'UPDATE question_banks SET updated_at = ? WHERE id = ?',
        (datetime.now(), bank_id)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'data': {'id': question_id}})


@app.route('/api/questions/<int:question_id>', methods=['PUT'])
def update_question(question_id):
    """更新题目"""
    data = request.get_json()
    content = json.dumps(data.get('content', {}), ensure_ascii=False)
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE questions SET content = ? WHERE id = ?',
        (content, question_id)
    )
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})


@app.route('/api/questions/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    """删除题目"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM questions WHERE id = ?', (question_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})


# ==================== 练习记录API ====================

@app.route('/api/records', methods=['GET'])
def get_records():
    """获取练习记录"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT r.*, b.name as bank_name, b.type
        FROM practice_records r
        JOIN question_banks b ON r.bank_id = b.id
        ORDER BY r.created_at DESC
        LIMIT 50
    ''')
    records = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'data': records})


@app.route('/api/records', methods=['POST'])
def save_record():
    """保存练习记录"""
    data = request.get_json()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO practice_records 
           (bank_id, question_id, type, score, total, details, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (
            data.get('bank_id'),
            data.get('question_id'),
            data.get('type'),
            data.get('score', 0),
            data.get('total', 0),
            json.dumps(data.get('details', {}), ensure_ascii=False),
            datetime.now()
        )
    )
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'data': {'id': record_id}})


@app.route('/api/records/<int:record_id>', methods=['DELETE'])
def delete_record(record_id):
    """删除练习记录"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM practice_records WHERE id = ?', (record_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})


# ==================== 统计数据API ====================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取统计数据"""
    conn = get_db()
    cursor = conn.cursor()
    
    # 总练习次数
    cursor.execute('SELECT COUNT(*) as total FROM practice_records')
    total_practice = cursor.fetchone()['total']
    
    # 各题型练习次数
    cursor.execute('''
        SELECT type, COUNT(*) as count 
        FROM practice_records 
        GROUP BY type
    ''')
    type_stats = {row['type']: row['count'] for row in cursor.fetchall()}
    
    # 最近7天练习次数
    cursor.execute('''
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM practice_records
        WHERE created_at >= DATE('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date
    ''')
    recent_stats = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': {
            'total_practice': total_practice,
            'type_stats': type_stats,
            'recent_stats': recent_stats
        }
    })


# 静态文件服务
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


# 禁用缓存
@app.after_request
def add_header(response):
    if 'Cache-Control' not in response.headers:
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response


def run_app(port=0):
    """运行应用"""
    init_db()
    
    if port == 0:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
        sock.close()
    
    print(f"Server starting on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=False, threaded=True)
    return port


if __name__ == '__main__':
    run_app(5000)
