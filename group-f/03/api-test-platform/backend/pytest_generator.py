from jinja2 import Template
from datetime import datetime


PYTEST_TEMPLATE = '''import pytest
import requests

BASE_URL = "{{ base_url }}"

class Test{{ class_name }}:
    
    def setup_method(self):
        self.session = requests.Session()
        self.headers = {{ headers }}
    {% for case in test_cases %}
    def test_{{ case.name }}(self):
        """{{ case.description or case.name }}"""
        url = f"{BASE_URL}{{ case.path }}"
        
        response = self.session.{{ case.method.lower() }}(
            url,
            headers=self.headers,
            {% if case.request_body %}json={{ case.request_body }},{% endif %}
            {% if case.request_params %}params={{ case.request_params }}{% endif %}
        )
        
        # 断言状态码
        assert response.status_code == {{ case.expected_status }}
        {% if case.expected_response %}
        # 断言响应数据
        response_data = response.json()
        expected_data = {{ case.expected_response }}
        {% for key in case.expected_response.keys() %}
        assert response_data.get("{{ key }}") == expected_data.get("{{ key }}")
        {% endfor %}{% endif %}
    {% endfor %}
'''


def generate_pytest_code(project, interface, test_cases):
    """生成pytest测试代码"""
    template = Template(PYTEST_TEMPLATE)
    
    class_name = interface.name.replace(" ", "").replace("_", "").title()
    
    cases_data = []
    for case in test_cases:
        cases_data.append({
            "name": case.name.replace(" ", "_").lower(),
            "description": case.description or case.name,
            "path": interface.path,
            "method": interface.method,
            "request_body": case.request_body,
            "request_params": case.request_params,
            "expected_status": case.expected_status,
            "expected_response": case.expected_response
        })
    
    code = template.render(
        base_url=project.base_url,
        class_name=class_name,
        headers=interface.headers or {},
        test_cases=cases_data
    )
    
    return code


def save_pytest_file(project_name, interface_name, code):
    """保存pytest文件到generated_tests目录"""
    filename = f"test_{project_name.lower()}_{interface_name.lower().replace(' ', '_')}.py"
    filepath = f"generated_tests/{filename}"
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(code)
    
    return filepath, filename
