import {MdOutlineArrowBack, MdAccessTime, MdCalendarMonth, MdOutlineTimer} from "react-icons/md";
import { Temporal } from "@js-temporal/polyfill";
import Image from "next/image";

export default function CallInfo({activeEvent, resetEvent, smallLayout, activeTime}) {

    const addOneHour = (startTime) => {
        let [hours, minutes] = startTime.split(":").map(Number);
        let time = Temporal.PlainTime.from({ hour: hours, minute: minutes });
        let newTime = time.add({ hours: 1 });

        return newTime.toString({ smallestUnit: "minute" });
    }

    const addDayFormat = (dateString) => {
        const date = Temporal.PlainDate.from(dateString);

        return date.toLocaleString("de-DE", {
            weekday: "long",
            day: "2-digit",
            month: "long",
        });
    }

    return (
        <div
            className={`info-content pl-2 pr-5 pb-5  border-r-slate-300 text-slate-700 ${smallLayout ? '' : activeEvent ? 'w-[30%] border-r-2' : 'w-[50%] mr-5 border-r-2'}`}>
            <div className={`logo-container flex items-center justify-center mb-3 border-b-slate-300 border-b-2 pb-5 relative`}>
                {activeEvent &&
                    <button className="flex gap-2 items-center mb-3 absolute top-0 left-0" onClick={resetEvent}>
                        <MdOutlineArrowBack className="rounded-full bg-[#085279] hover:bg-[#93221f] text-white font-bold w-7 h-7 p-1"/>
                    </button>
                }
                <Image src={'/img/casestudy/logo/Logo-Block.png'} alt={'RvD Calendry'} width={120} height={120}/>
            </div>
            <div className={`info-container`}>
                <Image src={'/img/casestudy/logo/Logo-Block.png'} alt={'RvD Calendry'} width={40} height={40}/>
                <div className={`corporate-info pt-2 pb-2`}>
                    <div className={`corporate-name font-bold text-neutral-500 text-sm`}>Rene van Dinter</div>
                    <div className={`corporate-subline text-sm text-neutral-400`}>Design & Development</div>
                </div>
                <h2 className={`font-bold text-2xl mb-2 pb-1 `}>Meeting Buchen</h2>
                <div className={`time-info flex items-center gap-2 mb-3`}>
                    <MdAccessTime className="text-slate-700 w-8 h-8"/>
                    <span className={`font-bold`}>1 Std.</span>
                </div>
                <div>
                    {activeEvent &&
                        <div className={`flex gap-2 items-center`}><MdCalendarMonth /> {addDayFormat(activeEvent)}</div>
                    }

                    {activeTime &&
                        <div className={`flex gap-2 items-center`}><MdOutlineTimer /> {activeTime} - {addOneHour(activeTime)}</div>
                    }

                </div>
                <div className={`info-text mt-2`}>
                    <h3 className={`font-bold mb-2`}>Lassen Sie uns Reden!</h3>
                    <p className={`text-md text-neutral-500`}>Haben Sie Fragen oder eine Idee, die Sie besprechen
                        möchten?<br/>Buchen Sie einfach einen Termin – unkompliziert und ohne Verpflichtungen!</p>
                </div>
            </div>
        </div>
    );
}