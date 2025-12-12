/**
 * Klondike Solitaire E2E Tests
 */

import { expect, test } from '@playwright/test'

test.describe('Klondike Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should render game board with all elements', async ({ page }) => {
    // Stock pile exists
    await expect(page.locator('.stock-pile')).toBeVisible()
    
    // Waste pile exists
    await expect(page.locator('.waste-pile')).toBeVisible()
    
    // 4 foundation piles
    await expect(page.locator('.foundation-pile')).toHaveCount(4)
    
    // 7 tableau columns
    await expect(page.locator('.tableau-column')).toHaveCount(7)
    
    // Game controls
    await expect(page.getByRole('button', { name: /undo/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /redo/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /new game/i })).toBeVisible()
  })

  test('should show cascading cards in tableau columns', async ({ page }) => {
    // First column should have 1 card (face up)
    const firstColumn = page.locator('.tableau-column').first()
    await expect(firstColumn.locator('.card')).toHaveCount(1)
    
    // Last column should have 7 cards
    const lastColumn = page.locator('.tableau-column').last()
    await expect(lastColumn.locator('.card')).toHaveCount(7)
  })
})

test.describe('Stock and Waste', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should draw card from stock to waste on click', async ({ page }) => {
    // Initially waste should be empty (no face-up cards visible)
    const wastePile = page.locator('.waste-pile')
    await expect(wastePile.locator('.card-face')).toHaveCount(0)
    
    // Click stock pile
    await page.locator('.stock-pile').click()
    
    // Now waste should have a face-up card
    await expect(wastePile.locator('.card-face')).toHaveCount(1)
  })
})

test.describe('Card Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should highlight card on click', async ({ page }) => {
    // Find a face-up card in tableau
    const faceUpCard = page.locator('.tableau-column .card-face').first()
    
    // Click to select
    await faceUpCard.click()
    
    // Should have selected class
    await expect(faceUpCard).toHaveClass(/selected/)
  })

  test('should deselect on Escape key', async ({ page }) => {
    const faceUpCard = page.locator('.tableau-column .card-face').first()
    await faceUpCard.click()
    await expect(faceUpCard).toHaveClass(/selected/)
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Should no longer be selected
    await expect(faceUpCard).not.toHaveClass(/selected/)
  })
})

test.describe('Game Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should start new game on button click', async ({ page }) => {
    // Draw a card first
    await page.locator('.stock-pile').click()
    
    // Click new game
    await page.getByRole('button', { name: /new game/i }).click()
    
    // Waste should be empty again
    await expect(page.locator('.waste-pile .card-face')).toHaveCount(0)
  })

  test('redo button should be disabled after stock draw (no undo performed)', async ({ page }) => {
    // Draw a card
    await page.locator('.stock-pile').click()
    
    // Redo button should be disabled (no undo was performed)
    await expect(page.getByRole('button', { name: /redo/i })).toBeDisabled()
  })

  test('should undo stock draw and clear waste pile', async ({ page }) => {
    // Draw a card
    await page.locator('.stock-pile').click()
    await expect(page.locator('.waste-pile .card-face')).toHaveCount(1)
    
    // Wait for undo button to be enabled, then click
    const undoButton = page.getByRole('button', { name: /undo/i })
    await expect(undoButton).toBeEnabled()
    await undoButton.click()
    
    // Waste should be empty
    await expect(page.locator('.waste-pile .card-face')).toHaveCount(0)
  })

  test('should redo after undo to restore stock draw', async ({ page }) => {
    // Draw a card
    await page.locator('.stock-pile').click()
    await expect(page.locator('.waste-pile .card-face')).toHaveCount(1)
    
    // Wait for undo button to be enabled, then undo
    const undoButton = page.getByRole('button', { name: /undo/i })
    await expect(undoButton).toBeEnabled()
    await undoButton.click()
    await expect(page.locator('.waste-pile .card-face')).toHaveCount(0)
    
    // Wait for redo button to be enabled, then redo
    const redoButton = page.getByRole('button', { name: /redo/i })
    await expect(redoButton).toBeEnabled()
    await redoButton.click()
    await expect(page.locator('.waste-pile .card-face')).toHaveCount(1)
  })
})
