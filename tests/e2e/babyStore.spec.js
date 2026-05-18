const { test, expect } = require('@playwright/test');

/**
 * 儿童管理 E2E 测试
 * 核心路径：添加儿童 → 编辑儿童 → 查看儿童详情 → 删除儿童
 */
test.describe('儿童管理模块', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟登录状态
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token-mock');
      localStorage.setItem('userId', 'test-user-001');
    });
  });

  test('添加儿童 - 正常流程', async ({ page }) => {
    await page.goto('/#/baby/store');
    
    // 点击添加按钮
    const addBtn = page.locator('button:has-text("添加儿童"), button:has-text("新增")').first();
    await addBtn.click();
    
    // 填写表单
    await page.fill('input[name="name"], input[placeholder*="姓名"]', '小明');
    await page.fill('input[name="age"], input[placeholder*="年龄"]', '8');
    
    // 选择性别
    await page.click('text=男');
    
    // 提交
    await page.click('button:has-text("确定"), button:has-text("保存")');
    
    // 验证添加成功
    await expect(page.locator('text=小明')).toBeVisible({ timeout: 5000 });
  });

  test('添加儿童 - 必填验证', async ({ page }) => {
    await page.goto('/#/baby/store');
    
    const addBtn = page.locator('button:has-text("添加儿童"), button:has-text("新增")').first();
    await addBtn.click();
    
    // 直接提交（不填内容）
    await page.click('button:has-text("确定"), button:has-text("保存")');
    
    // 验证错误提示
    const errorMsg = page.locator('text=请输入姓名, .error, .ant-form-item-explain');
    await expect(errorMsg.first()).toBeVisible();
  });

  test('编辑儿童信息', async ({ page }) => {
    await page.goto('/#/baby/store');
    
    // 等待儿童列表加载
    await page.waitForSelector('.baby-item, .child-item, [class*="baby"]', { timeout: 5000 }).catch(() => {});
    
    // 点击编辑按钮
    const editBtn = page.locator('button:has-text("编辑"), [class*="edit"]').first();
    await editBtn.click();
    
    // 修改姓名
    const nameInput = page.locator('input[name="name"], input[placeholder*="姓名"]').first();
    await nameInput.clear();
    await nameInput.fill('小明（已修改）');
    
    // 保存
    await page.click('button:has-text("确定"), button:has-text("保存")');
    
    // 验证修改成功
    await expect(page.locator('text=小明（已修改）')).toBeVisible({ timeout: 5000 });
  });

  test('删除儿童 - 确认取消', async ({ page }) => {
    await page.goto('/#/baby/store');
    
    // 等待列表加载
    await page.waitForSelector('.baby-item, .child-item, [class*="baby"]', { timeout: 5000 }).catch(() => {});
    
    // 点击删除按钮
    const deleteBtn = page.locator('button:has-text("删除"), [class*="delete"]').first();
    await deleteBtn.click();
    
    // 取消删除
    await page.click('button:has-text("取消")');
    
    // 验证列表仍有数据
    const listItems = page.locator('.baby-item, .child-item, [class*="baby"]');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('儿童详情页查看', async ({ page }) => {
    await page.goto('/#/baby/store');
    
    // 点击儿童卡片进入详情
    const babyCard = page.locator('.baby-item, .child-item, [class*="baby"]').first();
    await babyCard.click();
    
    // 验证详情页
    await expect(page.locator('text=积分, 任务, 成就')).toBeVisible({ timeout: 5000 });
  });
});
