"""testing 章节的配套被测模块：docs 页内代码块通过它 import cfg。"""


def parse_port(text):
    """解析端口字符串，非法值抛 ValueError。"""
    port = int(text)
    if not 1 <= port <= 65535:
        raise ValueError(f"端口越界: {port}")
    return port
