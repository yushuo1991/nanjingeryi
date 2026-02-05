/**
 * 清理重复患儿记录脚本
 * 规则：按姓名分组，只保留每个姓名最新的一条记录（ID最大的）
 */

const { getPool } = require('./db');

async function cleanupDuplicates() {
  const pool = await getPool();

  try {
    console.log('开始清理重复患儿记录...\n');

    // 1. 获取所有患儿记录
    const [patients] = await pool.query(
      'SELECT id, data, created_at FROM patients ORDER BY id'
    );

    console.log(`总患儿数: ${patients.length}\n`);

    if (patients.length === 0) {
      console.log('数据库中没有患儿记录');
      return;
    }

    // 2. 按姓名分组
    const nameGroups = {};

    patients.forEach(patient => {
      try {
        const data = JSON.parse(patient.data);
        const name = data.name || '未命名';

        if (!nameGroups[name]) {
          nameGroups[name] = [];
        }

        nameGroups[name].push({
          id: patient.id,
          name: name,
          created_at: patient.created_at,
          data: data
        });
      } catch (err) {
        console.error(`解析患儿 ID ${patient.id} 数据失败:`, err.message);
      }
    });

    // 3. 找出重复的记录
    const duplicates = [];
    const toDelete = [];

    Object.entries(nameGroups).forEach(([name, records]) => {
      if (records.length > 1) {
        // 按ID排序，ID最大的是最新的
        records.sort((a, b) => b.id - a.id);

        const keepRecord = records[0];
        const deleteRecords = records.slice(1);

        duplicates.push({
          name: name,
          total: records.length,
          keep: keepRecord,
          delete: deleteRecords
        });

        toDelete.push(...deleteRecords.map(r => r.id));
      }
    });

    // 4. 显示重复情况
    if (duplicates.length === 0) {
      console.log('✓ 没有发现重复的患儿记录');
      return;
    }

    console.log(`发现 ${duplicates.length} 个重复的姓名:\n`);

    duplicates.forEach(dup => {
      console.log(`姓名: ${dup.name}`);
      console.log(`  - 总记录数: ${dup.total}`);
      console.log(`  - 保留: ID ${dup.keep.id} (创建时间: ${dup.keep.created_at})`);
      console.log(`  - 删除: ${dup.delete.map(r => `ID ${r.id}`).join(', ')}`);
      console.log('');
    });

    console.log(`\n准备删除 ${toDelete.length} 条重复记录...\n`);

    // 5. 执行删除
    let deletedCount = 0;

    for (const id of toDelete) {
      try {
        const [result] = await pool.query(
          'DELETE FROM patients WHERE id = ?',
          [id]
        );

        if (result.affectedRows > 0) {
          deletedCount++;
          console.log(`✓ 已删除患儿 ID ${id}`);
        }
      } catch (err) {
        console.error(`✗ 删除患儿 ID ${id} 失败:`, err.message);
      }
    }

    console.log(`\n清理完成！`);
    console.log(`- 删除了 ${deletedCount} 条重复记录`);
    console.log(`- 保留了 ${duplicates.length} 条最新记录`);

    // 6. 显示清理后的统计
    const [afterPatients] = await pool.query('SELECT COUNT(*) as count FROM patients');
    console.log(`- 当前患儿总数: ${afterPatients[0].count}`);

  } catch (err) {
    console.error('清理过程出错:', err);
    throw err;
  }
}

// 运行清理
cleanupDuplicates()
  .then(() => {
    console.log('\n脚本执行完成');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n脚本执行失败:', err);
    process.exit(1);
  });
