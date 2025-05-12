'use client';
import { Temporal } from "@js-temporal/polyfill";
import { Fragment, useEffect, useRef, useState } from "react";
import CallMonth from "@/components/showcases/Callevent/CallMonth";
import { calendryData } from "@/lib/calendry/calendrydata";
import CallTimes from "@/components/showcases/Callevent/CallTimes";
import CallForm from "@/components/showcases/Callevent/CallForm";
import CallInfo from "@/components/showcases/Callevent/CallInfo";
import '@/../public/democss/calendry.css';


export default function CallEvent() {
    const [month, setMonth] = useState(Temporal.Now.plainDateISO().month);
    const [year, setYear] = useState(Temporal.Now.plainDateISO().year);
    const actualMonth = new Date().getMonth() + 1;

    const [activeEvent, setActiveEvent] = useState('');
    const [activeTime, setActiveTime] = useState('');

    const [sendData, setSendData] = useState('');

    const [smallLayout, setSmallLayout] = useState(false);
    const [xSmallLayout, setXSmallLayout] = useState(false);
    const containerRef = useRef(null);


    const eventData = calendryData;

    const prevMonth = () => {
        const { month: previousMonth, year: previousYear } = Temporal.PlainYearMonth.from({
            month,
            year,
        }).subtract({ months: 1 });

        setMonth(previousMonth);
        setYear(previousYear);
    };

    const nextMonth = () => {
        const { month: nextMonth, year: nextYear} = Temporal.PlainYearMonth.from({
            month,
            year,
        }).add({months: 1});

        setMonth(nextMonth);
        setYear(nextYear);
    }

    const handleClick = (eventID) => {
        console.log('Klicked ID Code: ',eventID);
        setActiveEvent(eventID);
        setActiveTime('');
    }

    const resetEvent = () => {
        activeTime
            ? setActiveTime('')
            : setActiveEvent('');

        setSendData('');
    }

    const handleTimeSet = (timeID) => {
        setActiveTime(timeID);
    }

    const handleNextData = (meetID) => {
        setSendData(meetID)
    }


    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                setSmallLayout(width < 768);
                setXSmallLayout(width < 600);
            }
        });

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        console.log('Aktuelles Layout:', smallLayout ? 'Kompakt' : 'Normal');
    }, [smallLayout]);


    const handleSubmit = async (e, formData) => {
        e.preventDefault();

        console.log('Active Date: ', activeEvent);
        console.log('Active Time: ', activeTime);
        console.log('Form Data: ', formData)
    }


    return(
        <>
            <div className={`mt-20 mb-10`}>
                <div ref={containerRef} className={`calendry-app flex ${smallLayout ? 'flex-col' : 'flex-row'}  p-2 bg-neutral-200 rounded max-w-[800px] ml-2 mr-2 lg:ml-0 lg:mr-0`}>
                    <CallInfo
                        activeEvent={activeEvent}
                        resetEvent={resetEvent}
                        smallLayout={smallLayout}
                        activeTime={activeTime}
                    />
                    {!sendData &&
                        <>
                            <div className={`calendry-app-right  flex flex-auto justify-center ${smallLayout ? '' : 'w-[300px]'}`}>
                                {!xSmallLayout &&
                                    <CallMonth
                                        year={year}
                                        month={month}
                                        dataEvents={eventData}
                                        activeDay={activeEvent}
                                        handleClick={handleClick}
                                        smallLayout={smallLayout}
                                        prevMonth={prevMonth}
                                        nextMonth={nextMonth}
                                        actualMonth={actualMonth}
                                    />
                                }
                                {xSmallLayout && !activeEvent &&
                                        <CallMonth
                                            year={year}
                                            month={month}
                                            dataEvents={eventData}
                                            activeDay={activeEvent}
                                            handleClick={handleClick}
                                            smallLayout={smallLayout}
                                            prevMonth={prevMonth}
                                            nextMonth={nextMonth}
                                            actualMonth={actualMonth}
                                        />

                                }
                                {activeEvent &&
                                    <CallTimes
                                        dataEvents={eventData}
                                        activeEvent={activeEvent}
                                        handleTimeSet={handleTimeSet}
                                        handleNextData={handleNextData}
                                        activeTime={activeTime}
                                        smallLayout={smallLayout}
                                        xSmallLayout={xSmallLayout}
                                    />
                                }
                            </div>
                        </>
                    }
                    {sendData &&
                        <CallForm
                            smallLayout={smallLayout}
                            activeEvent={activeEvent}
                            activeTime={activeTime}
                            handleSubmit={handleSubmit}
                        />
                    }
                </div>
            </div>
        </>
    )
}