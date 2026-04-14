# -*- coding:utf-8 -*-
import os
import json
from flask import request, jsonify, render_template
from datetime import datetime
from flask import Blueprint

my_website_bp = Blueprint('my_website', __name__)


@my_website_bp.route('/get_my_website')
def get_my_website():
    return render_template('myWebSite.html')


DATA_FILE = './config/my_url.json'


# 读取数据
def read_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


# 保存数据
def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# 获取指定版本的数据
@my_website_bp.route('/get_my_website/data', methods=['GET'])
def get_data():
    try:
        # 获取并验证版本ID
        version_id = request.args.get('version_id')
        if not version_id:
            return jsonify({"status": "error", "message": "版本ID不能为空"}), 400

        data = read_data()

        # 检查版本是否存在
        version_exists = any(v['id'] == version_id for v in data['versions'])
        if not version_exists:
            version_id = 'default'
            # return jsonify({"status": "error", "message": f"版本ID '{version_id}' 不存在"}), 404

        # 找到指定版本
        current_version = next(v for v in data['versions'] if v['id'] == version_id)

        # 返回版本列表和当前版本数据
        return jsonify({
            "versions": data['versions'],
            "officeCurrentVersionId": version_id,
            "current_version": current_version
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 保存指定版本的数据
@my_website_bp.route('/get_my_website/data', methods=['POST'])
def update_data():
    try:
        new_data = request.json
        version_id = new_data.get('version_id')

        # 验证版本ID
        if not version_id:
            return jsonify({"status": "error", "message": "版本ID不能为空"}), 400

        data = read_data()

        # 检查版本是否存在
        version_index = next((i for i, v in enumerate(data['versions']) if v['id'] == version_id), None)
        if version_index is None:
            return jsonify({"status": "error", "message": f"版本ID '{version_id}' 不存在"}), 404

        # 更新指定版本的数据
        data['versions'][version_index] = new_data['current_version']
        save_data(data)

        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 添加新网址到指定版本
@my_website_bp.route('/get_my_website/urls', methods=['POST'])
def add_url():
    try:
        url_data = request.json
        version_id = url_data.get('version_id')

        # 验证版本ID
        if not version_id:
            return jsonify({"status": "error", "message": "版本ID不能为空"}), 400

        data = read_data()

        # 找到指定版本
        version = next((v for v in data['versions'] if v['id'] == version_id), None)
        if not version:
            return jsonify({"status": "error", "message": f"版本ID '{version_id}' 不存在"}), 404

        # 确保版本有urls列表
        if 'urls' not in version:
            version['urls'] = []

        # 生成新ID (全局唯一)
        all_urls = [url for v in data['versions'] for url in v.get('urls', [])]
        new_id = max((url['id'] for url in all_urls), default=0) + 1
        url_data['id'] = new_id

        # 添加新网址
        version['urls'].append(url_data)
        save_data(data)

        return jsonify({"status": "success", "id": new_id})
    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500


# 更新指定版本中的网址
@my_website_bp.route('/get_my_website/urls/<int:url_id>', methods=['PUT'])
def update_url(url_id):
    try:
        updated_data = request.json
        version_id = updated_data.get('version_id')

        # 验证版本ID
        if not version_id:
            return jsonify({"status": "error", "message": "版本ID不能为空"}), 400

        data = read_data()

        # 找到指定版本
        version = next((v for v in data['versions'] if v['id'] == version_id), None)
        if not version:
            return jsonify({"status": "error", "message": f"版本ID '{version_id}' 不存在"}), 404

        # 找到并更新网址
        url_index = next((i for i, url in enumerate(version['urls']) if url['id'] == url_id), None)
        if url_index is None:
            return jsonify({"status": "error", "message": f"网址ID '{url_id}' 不存在"}), 404

        version['urls'][url_index] = updated_data
        save_data(data)

        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 从指定版本删除网址
@my_website_bp.route('/get_my_website/urls/<int:url_id>', methods=['DELETE'])
def delete_url(url_id):
    try:
        # 获取版本ID
        version_id = request.args.get('version_id')
        if not version_id:
            return jsonify({"status": "error", "message": "版本ID不能为空"}), 400

        data = read_data()

        # 找到指定版本
        version = next((v for v in data['versions'] if v['id'] == version_id), None)
        if not version:
            return jsonify({"status": "error", "message": f"版本ID '{version_id}' 不存在"}), 404

        # 检查网址是否存在
        url_exists = any(url['id'] == url_id for url in version.get('urls', []))
        if not url_exists:
            return jsonify({"status": "error", "message": f"网址ID '{url_id}' 不存在"}), 404

        # 删除网址
        version['urls'] = [url for url in version.get('urls', []) if url['id'] != url_id]

        # 如果版本为空且不是默认版本，则删除该版本
        if not version['urls'] and version_id != 'default':
            data['versions'] = [v for v in data['versions'] if v['id'] != version_id]

            # 如果删除的是当前版本，则切换到默认版本
            if data['officeCurrentVersionId'] == version_id:
                data['officeCurrentVersionId'] = 'default'

        save_data(data)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# 创建新版本
@my_website_bp.route('/get_my_website/create_version', methods=['POST'])
def create_version():
    try:
        version_data = request.json
        data = read_data()

        # 找到源版本
        source_version = next((v for v in data['versions'] if v['id'] == version_data['sourceId']), None)
        if not source_version:
            return jsonify({"status": "error", "message": f"源版本ID不存在"}), 404

        # 创建新版本 - 增加categoryOrder的复制
        new_id = f"ver_{datetime.now().timestamp()}"
        new_version = {
            "id": new_id,
            "name": version_data['name'],
            "urls": [u.copy() for u in source_version.get('urls', [])],
            "collapsedCategories": source_version.get('collapsedCategories', []).copy(),
            # 新增：复制源版本的分类顺序
            "categoryOrder": source_version.get('categoryOrder', []).copy()
        }

        # 添加新版本并设为当前版本
        data['versions'].append(new_version)
        data['officeCurrentVersionId'] = new_id

        save_data(data)
        return jsonify({
            "status": "success",
            "id": new_id,
            # 新增：返回完整的新版本数据，包括categoryOrder
            "categoryOrder": new_version["categoryOrder"]
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



# 切换版本
@my_website_bp.route('/get_my_website/switch_version/<version_id>', methods=['POST'])
def switch_version(version_id):
    try:
        data = read_data()

        # 验证版本是否存在
        version_exists = any(v['id'] == version_id for v in data['versions'])
        if not version_exists:
            return jsonify({"status": "error", "message": f"版本ID '{version_id}' 不存在"}), 404

        # 更新当前版本ID
        data['officeCurrentVersionId'] = version_id
        save_data(data)

        return jsonify({"status": "success"})
    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500
