#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
切割科室图标脚本 - Windows兼容版
从网格布局的图片中切割出单个图标，并进行质量检查
"""

from PIL import Image
import os
import sys

# 设置UTF-8输出（Windows兼容）
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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

def crop_icons_with_padding(image_path, departments, output_dir, padding_percent=5):
    """
    从网格图片中切割图标，添加内边距以避免切到边缘

    Args:
        image_path: 原始图片路径
        departments: 科室名称的二维数组（行x列）
        output_dir: 输出目录
        padding_percent: 内边距百分比（默认5%）
    """
    print(f"\n处理图片: {os.path.basename(image_path)}")

    # 打开图片
    img = Image.open(image_path)
    width, height = img.size
    print(f"图片尺寸: {width}x{height}")

    # 计算网格尺寸
    rows = len(departments)
    cols = len(departments[0])

    # 计算每个图标的区域尺寸
    cell_width = width // cols
    cell_height = height // rows

    print(f"网格: {rows}行 x {cols}列")
    print(f"每个单元格: {cell_width}x{cell_height}")

    # 计算内边距
    padding_x = int(cell_width * padding_percent / 100)
    padding_y = int(cell_height * padding_percent / 100)
    print(f"内边距: {padding_x}px (横向), {padding_y}px (纵向)")

    # 切割每个图标
    for row in range(rows):
        for col in range(cols):
            dept_name = departments[row][col]

            # 计算切割区域（添加内边距）
            left = col * cell_width + padding_x
            top = row * cell_height + padding_y
            right = (col + 1) * cell_width - padding_x
            bottom = (row + 1) * cell_height - padding_y

            # 切割图标
            icon = img.crop((left, top, right, bottom))

            # 保存图标
            output_path = os.path.join(output_dir, f"{dept_name}.png")
            icon.save(output_path, 'PNG', quality=95)

            print(f"[OK] 已保存: {dept_name}.png ({icon.size[0]}x{icon.size[1]})")

    print(f"完成处理: {os.path.basename(image_path)}\n")

def check_quality(output_dir):
    """检查切割出的图标质量"""
    print("\n=== 质量检查 ===")

    files = [f for f in os.listdir(output_dir) if f.endswith('.png')]

    if not files:
        print("[警告] 未找到任何PNG文件")
        return False

    all_good = True
    for filename in sorted(files):
        filepath = os.path.join(output_dir, filename)
        img = Image.open(filepath)
        width, height = img.size

        # 检查尺寸
        if width < 200 or height < 200:
            print(f"[警告] {filename}: 尺寸较小 ({width}x{height})")
            all_good = False
        elif width < 300 or height < 300:
            print(f"[提示] {filename}: 尺寸中等 ({width}x{height})")
        else:
            print(f"[OK] {filename}: 尺寸良好 ({width}x{height})")

    return all_good

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    original_dir = os.path.join(script_dir, 'original')
    output_dir = os.path.join(script_dir, 'output')

    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)

    print("=== 科室图标切割工具 ===\n")

    # 处理第一张图片
    image1_path = os.path.join(original_dir, 'departments1.png')
    if os.path.exists(image1_path):
        crop_icons_with_padding(image1_path, DEPARTMENTS_IMAGE1, output_dir)
    else:
        print(f"[警告] 未找到图片: {image1_path}")

    # 处理第二张图片
    image2_path = os.path.join(original_dir, 'departments2.png')
    if os.path.exists(image2_path):
        crop_icons_with_padding(image2_path, DEPARTMENTS_IMAGE2, output_dir)
    else:
        print(f"[警告] 未找到图片: {image2_path}")

    # 质量检查
    quality_ok = check_quality(output_dir)

    print("\n=== 完成 ===")
    print(f"输出目录: {output_dir}")
    print(f"共切割: {len([f for f in os.listdir(output_dir) if f.endswith('.png')])} 个图标")

    if quality_ok:
        print("[OK] 所有图标质量检查通过")
    else:
        print("[提示] 部分图标需要调整")

if __name__ == '__main__':
    main()
