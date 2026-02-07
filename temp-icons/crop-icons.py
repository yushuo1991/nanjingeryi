#!/usr/bin/env python3
"""
切割科室图标脚本
从网格布局的图片中切割出单个图标
"""

from PIL import Image
import os

# 科室名称映射（按照图片中的位置）
DEPARTMENTS_IMAGE1 = [
    ['口腔科', '眼科'],
    ['耳鼻喉科', '皮肤科'],
    ['心血管内科', '骨科']
]

DEPARTMENTS_IMAGE2 = [
    ['呼吸内科', '消化内科'],
    ['神经内科', '康复科'],
    ['儿保科', '外科']
]

def crop_icons(image_path, departments, output_dir):
    """
    从网格图片中切割图标

    Args:
        image_path: 原始图片路径
        departments: 科室名称的二维数组（行x列）
        output_dir: 输出目录
    """
    print(f"\n处理图片: {image_path}")

    # 打开图片
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")

    # 计算网格尺寸
    rows = len(departments)
    cols = len(departments[0])

    # 计算每个图标的尺寸（考虑边距）
    # 假设图标之间有均匀的间距
    icon_width = width // cols
    icon_height = height // rows

    print(f"网格: {rows}行 x {cols}列")
    print(f"每个图标区域: {icon_width}x{icon_height}")

    # 切割每个图标
    for row in range(rows):
        for col in range(cols):
            dept_name = departments[row][col]

            # 计算切割区域（添加一些边距调整）
            left = col * icon_width
            top = row * icon_height
            right = (col + 1) * icon_width
            bottom = (row + 1) * icon_height

            # 切割图标
            icon = img.crop((left, top, right, bottom))

            # 保存图标
            output_path = os.path.join(output_dir, f"{dept_name}.png")
            icon.save(output_path, 'PNG')

            print(f"✓ 已保存: {dept_name}.png ({icon.size[0]}x{icon.size[1]})")

    print(f"完成处理: {image_path}\n")

def check_quality(output_dir):
    """检查切割出的图标质量"""
    print("\n=== 质量检查 ===")

    files = [f for f in os.listdir(output_dir) if f.endswith('.png')]

    for filename in sorted(files):
        filepath = os.path.join(output_dir, filename)
        img = Image.open(filepath)
        width, height = img.size

        # 检查尺寸
        if width < 200 or height < 200:
            print(f"⚠ {filename}: 尺寸较小 ({width}x{height})")
        else:
            print(f"✓ {filename}: {width}x{height}")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    original_dir = os.path.join(script_dir, 'original')
    output_dir = os.path.join(script_dir, 'output')

    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)

    # 处理第一张图片
    image1_path = os.path.join(original_dir, 'image1.png')
    if os.path.exists(image1_path):
        crop_icons(image1_path, DEPARTMENTS_IMAGE1, output_dir)
    else:
        print(f"未找到图片: {image1_path}")

    # 处理第二张图片
    image2_path = os.path.join(original_dir, 'image2.png')
    if os.path.exists(image2_path):
        crop_icons(image2_path, DEPARTMENTS_IMAGE2, output_dir)
    else:
        print(f"未找到图片: {image2_path}")

    # 质量检查
    check_quality(output_dir)

    print("\n所有图标已切割完成！")
    print(f"输出目录: {output_dir}")

if __name__ == '__main__':
    main()
