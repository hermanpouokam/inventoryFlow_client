import React from 'react'
import i18n from 'i18next'

export default function DeleteBill() {
    return (
        <div>{i18n.t('bills.actions.delete_bill')}</div>
    )
}
