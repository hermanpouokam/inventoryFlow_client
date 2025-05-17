'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initClientI18n } from '@/i18n/i18n.client';
import * as React from "react";
import { instance } from '@/components/fetch';
import { getToken, storeUserData } from '@/components/auth';
import usePageTracking from '@/utils/usePageTracking';
import useInteractionTracking from '@/utils/useInteractionTracking';

type ClientLayoutProps = {
    children: ReactNode;
    lng: string;
    resources: any; // ou Record<string, any> si tu veux plus strict
};

export default function ClientLayout({ children, lng, resources }: ClientLayoutProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initClientI18n(lng, resources).then(() => setReady(true));
    }, [lng, resources]);

    React.useEffect(() => {
        const asyncFunc = async () => {
            const res = await instance.get("current-user");
            await storeUserData(res.data);
            console.log(getToken());
        };
        asyncFunc();
    }, []);
  usePageTracking();
  useInteractionTracking();
    if (!ready) return null;

    return <>{children}</>;
}
