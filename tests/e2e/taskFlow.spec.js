const { test, expect } = require('@playwright/test');

/**
 * 任务流程 E2E 测试
 * 核心路径：创建任务 → 分配任务 → 完成审核 → 积分发放
 */
test.describe('任务流程模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token-mock');
      localStorage.setItem('userId', 'test-user-001');
    });
  });

  test('创建新任务', async ({ page }) => {
    await page.goto('/#/task/list');
    
    // 点击创建任务
    const createBtn = page.locator('button:has-text("创建任务"), button:has-text("新建任务")').first();
    await createBtn.click();
    
    // 填写任务信息
    await page.fill('input[name="title"], input[placeholder*="任务名称"]', '每日阅读30分钟');
    await page.fill('textarea[name="desc"], textarea[placeholder*="描述"]', '每天阅读课外书30分钟');
    
    // 设置积分
    await page.fill('input[name="points"], input[placeholder*="积分"]', '10');
    
    // 提交
    await page.click('button:has-text("确定"), button:has-text("发布")');
    
    // 验证任务出现
    await expect(page.locator('text=每日阅读30分钟')).toBeVisible({ timeout: 5000 });
  });

  test('任务必填项验证', async ({ page }) => {
    await page.goto('/#/task/list');
    
    const createBtn = page.locator('button:has-text("创建任务"), button:has-text("新建任务")').first();
    await createBtn.click();
    
    // 空表单提交
    await page.click('button:has-text("确定"), button:has-text("发布")');
    
    // 验证错误
    const errorMsg = page.locator('text=请输入任务名称, .error, .ant-form-item-explain');
    await expect(errorMsg.first()).toBeVisible();
  });

  test('分配任务给儿童', async ({ page }) => {
    await page.goto('/#/task/list');
    
    // 选择一个任务
    const taskItem = page.locator('.task-item, [class*="task"]').first();
    await taskItem.click();
    
    // 点击分配
    await page.click('button:has-text("分配"), button:has-text("指派")');
    
    // 选择儿童
    const childOption = page.locator('.ant-select-item, [class*="child"] option').first();
    await childOption.click();
    
    // 确认
    await page.click('button:has-text("确定"), button:has-text("确认")');
    
    // 验证分配成功
    await expect(page.locator('text=已分配, text=指派成功')).toBeVisible({ timeout: 5000 });
  });

  test('审核任务完成', async ({ page }) => {
    await page.goto('/#/task/audit');
    
    // 等待待审核列表
    await page.waitForSelector('.task-item, [class*="task"]', { timeout: 5000 }).catch(() => {});
    
    // 点击审核按钮
    const approveBtn = page.locator('button:has-text("通过"), button:has-text("审核通过")').first();
    await approveBtn.click();
    
    // 确认通过
    await page.click('button:has-text("确认"), button:has-text("确定")');
    
    // 验证成功提示
    await expect(page.locator('text=审核通过, text=操作成功')).toBeVisible({ timeout: 5000 });
  });

  test('积分扣除操作', async ({ page }) => {
    await page.goto('/#/task/list');
    
    // 进入任务详情
    const taskItem = page.locator('.task-item, [class*="task"]').first();
    await taskItem.click();
    
    // 查找积分操作
    const deductBtn = page.locator('button:has-text("扣分"), button:has-text("扣除积分")').first();
    await deductBtn.click();
    
    // 输入扣除积分
    await page.fill('input[name="deductPoints"]', '5');
    
    // 确认
    await page.click('button:has-text("确定"), button:has-text("确认")');
    
    // 验证
    await expect(page.locator('text=已扣除, text=操作成功')).toBeVisible({ timeout: 5000 });
  });
});
