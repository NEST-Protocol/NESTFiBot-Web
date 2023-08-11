'use client'

import {useAccount, useSignMessage} from "wagmi";
import useSWRImmutable from "swr/immutable";
import {FC, useEffect} from "react";
import {useRouter} from "next/navigation";

type SignatureProps = {
  code: string
}

export const Signature: FC<SignatureProps> = ({code}) => {
  const {address, status: accountStatus} = useAccount();
  const router = useRouter()
  const {signMessage, status: signMessageStatus, data: signMessageData} = useSignMessage({
    message: 'https://nestfi.org',
  })
  const { data: jwt, isLoading:  isJwtLoading} = useSWRImmutable((signMessageData && address) ? (`https://api.nestfi.net/nestfi/op/user/login?chainId=56&remember=true&walletAddress=${address}`) : undefined, (url: any) => fetch(url, {
    method: "POST",
    headers: {
      signature: `${signMessageData}`
    }
  })
    .then(res => res.json())
    .then(res => res.value.token));

  const { data: result, isLoading: isResultLoading} = useSWRImmutable((jwt && code) ? `/api/auth` : undefined, (url) => fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      code,
      jwt,
    })
  }))

  useEffect(() => {
    if (result?.status === 200) {
      router.push('https://t.me/nestfibot')
    }
  }, [result?.status])

  if (result?.status === 200) {
    return (
      <div>
        Success!
      </div>
    )
  }

  if (isJwtLoading || isResultLoading) {
    return (
      <div>
        Loading...
      </div>
    )
  }

  return (
    <button
      disabled={!address || signMessageStatus === 'loading'}
      className={'bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50'}
      onClick={() => signMessage()}
    >
      {
        signMessageStatus === 'loading' ? 'Signing...' : 'Sign with wallet'
      }
    </button>
  )
}