'use client';
import {ConnectButton, useConnectModal} from '@rainbow-me/rainbowkit';
import {useAccount, useSignMessage} from "wagmi";
import {useEffect, useState} from "react";

type TelegramData = {
  hash: string,
  id: number,
  photo_url: string,
  first_name?: string,
  last_name?: string,
  username: string,
  auth_date: number,
}

function Page() {
  const {openConnectModal} = useConnectModal();
  const [userData, setUserData] = useState<TelegramData | undefined>(undefined)
  const {address, status: accountStatus} = useAccount()
  const {signMessage, status: signMessageStatus, data: signMessageData} = useSignMessage({
    message: 'https://nestfi.org',
  })

  useEffect(() => {
    if (!address && openConnectModal) {
      openConnectModal()
    }
  }, [address])

  useEffect(() => {
    // @ts-ignore
    if (window?.Telegram?.WebApp) {
      // @ts-ignore
      console.log(window?.Telegram?.WebApp)
    }
  }, [])

  const getJwt = async (signature: string) => {
    return '123'
  }

  return (
    <div className={'flex flex-col p-2'}>
      <div className={'flex justify-between items-center pb-2 border-b'}>
        <ConnectButton/>
      </div>
      <div className={'flex flex-col items-center justify-center py-40 gap-10'}>
        <div>
          这将允许“NESTFi Bot for Telegram”:<br/>
          - 查看你的账户余额，持仓历史信息；<br/>
          - 管理你的持仓；<br/>

         请确保您信任NESTFi Bot for Telegram。
        </div>
        <button
          disabled={!address || signMessageStatus === 'loading'}
          className={'bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50'}
          onClick={() => signMessage()}
        >
          {
            signMessageStatus === 'loading' ? 'Signing...' : 'Sign with wallet'
          }
        </button>
        <button
          className={'bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50'}>
          Continue with telegram
        </button>
        <div>
          {signMessageData}
        </div>
      </div>
    </div>
  );
}

export default Page;
