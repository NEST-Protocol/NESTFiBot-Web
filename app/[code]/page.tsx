import {Signature} from "./Signature";
import {Redis} from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

async function Page({params}: {
  params: {
    code: string
  }
}) {
  const userInfo = await redis.get(`code:${params.code}`) as any
  // @ts-ignore
  const user = userInfo?.user
  if (!user) {
    return (
      <div className={'px-4 py-2 text-[#F9F9F9]'}>
        Sorry, the link is no longer valid.
      </div>
    )
  }

  return (
    <div className={'w-screen h-screen flex items-center justify-center px-[16px]'}>
      <div className={'flex flex-col py-[40px] px-[20px] max-w-[450px] md:shadow border border-[#ffffff14] rounded-[12px] items-center gap-[20px]'}>
        <div className={'p-4 rounded text-xl w-full text-center font-bold flex justify-center space-x-1'}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M14 25.6668C20.4433 25.6668 25.6666 20.4435 25.6666 14.0002C25.6666 7.55684 20.4433 2.3335 14 2.3335C7.55666 2.3335 2.33331 7.55684 2.33331 14.0002C2.33331 20.4435 7.55666 25.6668 14 25.6668ZM20.4103 9.53337C20.5182 8.36826 19.2231 8.84801 19.2231 8.84801C18.2668 9.22405 17.2806 9.60621 16.2838 9.9925C13.1929 11.1902 9.99959 12.4277 7.27936 13.6455C5.80438 14.1596 6.66779 14.6736 6.66779 14.6736L9.00618 15.3589C10.0854 15.6673 10.661 15.3247 10.661 15.3247L15.6975 12.0692C17.4963 10.9041 17.0646 11.8636 16.6329 12.2748L12.8555 15.7016C12.2799 16.1813 12.5677 16.5926 12.8195 16.7982C13.5332 17.3964 15.2889 18.4909 16.0554 18.9688C16.2548 19.0931 16.3873 19.1757 16.417 19.1969C16.5969 19.334 17.5682 19.9508 18.2158 19.8138C18.8634 19.6767 18.9353 18.8885 18.9353 18.8885L19.7987 13.5085C19.9282 12.5744 20.0767 11.6767 20.1954 10.9597C20.3074 10.2824 20.3928 9.7664 20.4103 9.53337Z" fill="#29ABE2"/>
          </svg>
          <span className={'text-[#F9F9F9]'}>
            @{user.username}
          </span>
        </div>
        <div className={'px-[20px] py-[32px] w-full rounded-[12px] bg-[#1F2329] text-[#F9F9F9] mt-[20px]'}>
          <p className={'font-bold'}>
            It will allow the NESTFi Copy Trading bot view your address, account balance and position information.
          </p>
          <br/>
          <p className={'text-sm'}>
            Please make sure your are using the official NESTFi Copy Trading bot. <a href={'https://t.me/NESTFiBot'} target={'_blank'} className={'text-[#EAAA00]'}>
            @NESTFiBot
          </a>
          </p>
        </div>
        <Signature code={params.code}/>
      </div>
    </div>
  );
}

export default Page;
