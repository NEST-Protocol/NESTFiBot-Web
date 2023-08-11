'use client'

import {useAccount, useSignMessage} from "wagmi";
import useSWRImmutable from "swr/immutable";
import {FC, useEffect} from "react";

type SignatureProps = {
  code: string
}

export const Signature: FC<SignatureProps> = ({code}) => {
  const {address, status: accountStatus} = useAccount();
  const {signMessage, status: signMessageStatus, data: signMessageData} = useSignMessage({
    message: 'https://nestfi.org',
  })

  const { data: jwt, mutate: mutateJwt, isLoading:  isJwtLoading} = useSWRImmutable((signMessageData && address) ? (`https://api.nestfi.net/nestfi/op/user/login?chainId=56&remember=false&walletAddress=${address}`) : undefined, (url: any) => fetch(url, {
    method: "POST",
    headers: {
      signature: `${signMessageData}`
    }
  })
    .then(res => res.json())
    .then(res => res.value.token));

  const { data: result, isLoading: isBindLoading  } = useSWRImmutable((jwt && code) ? `/api/auth` : undefined, (url) => fetch(url, {
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
    <div>
      <button
        disabled={!address || signMessageStatus === 'loading'}
        className={'bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50'}
        onClick={() => signMessage()}
      >
        {
          signMessageStatus === 'loading' ? 'Signing...' : 'Sign with wallet'
        }
      </button>
    </div>
  )
}