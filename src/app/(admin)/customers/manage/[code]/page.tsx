'use client'
import { fetchClientsData } from '@/redux/customerBillSlicer';
import { AppDispatch, RootState } from '@/redux/store';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

export default function Page({ params }: { params: { code: string } }) {

    const dispatch: AppDispatch = useDispatch()

    const { data, error, status } = useSelector((state: RootState) => state.clientData)

    React.useEffect(() => {
        if (status === 'idle') {
            const param = {
                customer_code: params.code
            }
            dispatch(fetchClientsData(param))
        }
    }, [status, dispatch]);
    console.log(data)

    return <h1>{params.code}</h1>
}