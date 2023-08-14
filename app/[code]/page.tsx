import {ConnectButton} from '@rainbow-me/rainbowkit';
import {Signature} from "./Signature";

async function getData(code: string) {
  return await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/code:${code}`, {
      headers: {
        "Authorization": `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
      },
      cache: 'no-cache',
    })
      .then(response => response.json())
      .then((data: any) => JSON.parse(data.result))
}

async function Page({params}: {
  params: {
    code: string
  }
}) {
  const {user} = await getData(params.code)

  if (!user) {
    return (
      <div className={'px-4 py-2'}>
        Sorry, something went wrong.
      </div>
    )
  }

  return (
    <div className={'flex flex-col py-2 px-4 w-full xl:max-w-md md:shadow md:mt-20'}>
      <div className={'flex justify-between items-center'}>
        <ConnectButton/>
      </div>
      <div className={'flex flex-col items-center justify-center py-20 gap-10'}>
        <div className={'bg-red-200 p-4 rounded text-xl w-full text-center font-bold'}>
          Telegram: @{user.username}
        </div>
        <div className={'bg-red-200 p-4 rounded w-full'}>
          欢迎使用 NESTFi Bot for Telegram。
          这将允许“NESTFi Bot for Telegram”:<br/>
          - 查看你的账户余额，持仓历史信息；<br/>
          - 管理你的持仓；<br/>

          请确保您信任NESTFi Bot for Telegram。
        </div>
        <Signature code={params.code}/>
      </div>
    </div>
  );
}

export default Page;
