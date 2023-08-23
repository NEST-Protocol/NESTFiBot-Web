'use client'

import {useAccount, useSignMessage} from "wagmi";
import useSWRImmutable from "swr/immutable";
import {FC} from "react";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {hostname} from "../misc";

type SignatureProps = {
  code: string
}

export const Signature: FC<SignatureProps> = ({code}) => {
  const { connector: activeConnector, isConnected } = useAccount()
  const {address, status: accountStatus} = useAccount();
  const {signMessage, status: signMessageStatus, data: signMessageData} = useSignMessage({
    message: 'https://nestfi.org',
  })
  const {
    data: jwt,
    isLoading: isJwtLoading
  } = useSWRImmutable((signMessageData && address) ? (`${hostname}/nestfi/op/user/login?chainId=56&remember=true&walletAddress=${address}`) : undefined, (url: any) => fetch(url, {
    method: "POST",
    headers: {
      signature: `${signMessageData}`
    }
  })
    .then(res => res.json())
    .then(res => res.value.token));

  const {
    data: result,
    isLoading: isResultLoading
  } = useSWRImmutable((jwt && code) ? `/api/auth` : undefined, (url) => fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      jwt,
    })
  }))

  return (
    <div className={'flex flex-col w-full gap-[20px]'}>
      <div className={'w-full'}>
        <ConnectButton.Custom>
          {({
              account,
              chain,
              openAccountModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');
            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button onClick={openConnectModal} type="button" className={'bg-[#EAAA00] font-bold h-12 rounded-[12px] w-full'}>
                        Connect Wallet
                      </button>
                    );
                  }
                  return (
                    <div className={'w-full h-12 text-[#F9F9F9] text-sm bg-[#1F2329] flex items-center justify-center font-bold rounded-[12px]'}>
                      <button onClick={openAccountModal} type="button">
                        <div className={'flex items-center gap-2'}>
                          <img alt={''} src={chain.iconUrl} width="20" height="20"/>
                          {account.displayName}
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M4.56882 6.44729C4.30886 6.87261 3.69112 6.87261 3.43116 6.44729L0.925525 2.34784C0.654003 1.9036 0.973712 1.3335 1.49435 1.3335L6.50563 1.3335C7.02627 1.3335 7.34598 1.9036 7.07446 2.34784L4.56882 6.44729Z" fill="#F9F9F9" fillOpacity="0.6"/>
                          </svg>
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
      {
        address && (
          result?.status === 200 ? (
            <div className={'text-[#36C56E] flex items-center gap-[8px] justify-center'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <g clipPath="url(#clip0_17316_67961)">
                  <path fillRule="evenodd" clipRule="evenodd"
                        d="M13.1855 13.1853C11.8584 14.5124 10.0251 15.3332 8.00008 15.3332C5.97505 15.3332 4.14172 14.5124 2.81463 13.1853C1.48756 11.8582 0.666748 10.0249 0.666748 7.99984C0.666748 5.97481 1.48756 4.14148 2.81463 2.81439C4.14172 1.48732 5.97505 0.666504 8.00008 0.666504C10.0251 0.666504 11.8584 1.48732 13.1855 2.81439C14.5126 4.14148 15.3334 5.97481 15.3334 7.99984C15.3334 10.0249 14.5126 11.8582 13.1855 13.1853ZM11.8048 6.47124C12.0652 6.21089 12.0652 5.78878 11.8048 5.52843C11.5445 5.26808 11.1224 5.26808 10.862 5.52843L7.33341 9.05703L5.80482 7.52843C5.54447 7.26808 5.12236 7.26808 4.86201 7.52843C4.60166 7.78878 4.60166 8.21089 4.86201 8.47124L6.86201 10.4712C7.12236 10.7316 7.54447 10.7316 7.80482 10.4712L11.8048 6.47124Z"
                        fill="#36C56E"/>
                </g>
                <defs>
                  <clipPath id="clip0_17316_67961">
                    <rect width="16" height="16" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              Successfully Linked Wallet!
            </div>
          ) : (
            (isJwtLoading || isResultLoading) ? (
              <div className={'w-full text-center text-sm text-[#F9F9F9]'}>
                Please wait...
              </div>
            ) : (
              <button
                disabled={!address || signMessageStatus === 'loading'}
                className={'bg-[#EAAA00] text-[#030308] w-full font-bold disabled:opacity-50 h-[48px] rounded-[12px]'}
                onClick={() => signMessage()}
              >
                {
                  signMessageStatus === 'loading' ? 'Linking...' : 'Link Wallet'
                }
              </button>
            )
          )
        )
      }
    </div>
  )
}