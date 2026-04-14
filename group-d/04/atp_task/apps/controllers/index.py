# atp/apps/controllers/index.py
from flask import render_template, Blueprint

get_index_bp = Blueprint('get_index', __name__)



@get_index_bp.route('/')
def get_index():
    """提供主页面访问"""
    return render_template('index.html')

