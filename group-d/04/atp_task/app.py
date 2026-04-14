# atp/app.py
from flask import Flask, request, jsonify, session, render_template
from flask_cors import CORS
import os
import logging
from waitress import serve


# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('./logs/app.log'),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)
# 从环境变量获取密钥，开发环境使用默认值
app.secret_key = os.environ.get('APP_SECRET_KEY', 'nf_tester')

# 注册蓝图
from apps.controllers.index import get_index_bp
from apps.controllers.my_web_site import my_website_bp
app.register_blueprint(get_index_bp)
app.register_blueprint(my_website_bp)

# 配置会话有效期为2小时
app.permanent_session_lifetime = 7200

# 配置CORS，允许特定域名的跨域请求
CORS(app, supports_credentials=True)



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 80))
    # debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    # app.run(debug=debug, host='0.0.0.0', port=port)
    serve(app, host='0.0.0.0', port=port)
