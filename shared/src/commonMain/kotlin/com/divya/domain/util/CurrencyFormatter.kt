package com.divya.domain.util

object CurrencyFormatter {
    fun format(amount: Double, currency: String): String {
        val whole = amount.toLong()
        val fraction = ((amount - whole) * 100).toInt().toString().padStart(2, '0')
        return "${currency.uppercase()} $whole.$fraction"
    }
}
