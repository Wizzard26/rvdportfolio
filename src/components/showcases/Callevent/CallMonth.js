'use client';
import { Temporal } from "@js-temporal/polyfill";
import {Fragment, useEffect, useState} from "react";
import styles from "@/components/showcases/Callevent/style.module.css";
import {MdOutlineArrowBackIos, MdOutlineArrowForwardIos} from "react-icons/md";


export default function CallMonth({year, month, handleClick, activeDay, dataEvents, smallLayout, prevMonth, nextMonth, actualMonth}) {
    const [monthCalendar, setMonthCalendar] = useState([]);
    const currentDay = Temporal.Now.plainDateISO().dayOfYear;

    const eventData = dataEvents;


    useEffect(() => {
        const fiveWeeks = 5 * 7;
        const sixWeeks = 6 * 7;
        const startOfMonth = Temporal.PlainDate.from({year, month, day: 1});
        const monthLength = startOfMonth.daysInMonth;
        const dayOfWeekMonthStartedOn = startOfMonth.dayOfWeek - 1;
        const length = dayOfWeekMonthStartedOn + monthLength > fiveWeeks ? sixWeeks : fiveWeeks;

        const calendar = new Array(length)
            .fill([])
            .map((_, index) => {
                const date = startOfMonth.add({
                    days: index - dayOfWeekMonthStartedOn,
                });

                return {
                    isInMonth: !(
                        index < dayOfWeekMonthStartedOn ||
                        index - dayOfWeekMonthStartedOn >= monthLength
                    ),
                    date,
                }

            })

        setMonthCalendar(calendar);

    }, [year, month]);

    return (
        <div className={`calendry-app-cal`}>
            <div className="flex mt-5 mb-5 gap-3 pb-2 items-center justify-center calendry-app-cal-switch">
                <button
                    disabled={month <= actualMonth ? 'disabled' : undefined}
                    className={`${styles.calLayoutsBtn} btn btn-blue rounded-full w-10 h-10 content-center me-2 flex items-center justify-center`}
                    onClick={prevMonth}>
                    <MdOutlineArrowBackIos/>
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                    {Temporal.PlainDate.from({year, month, day: 1}).toLocaleString("de", {
                        month: "long",
                        year: "numeric",
                    })}
                </h2>
                <button
                    className={`${styles.calLayoutsBtn} btn btn-blue rounded-full w-10 h-10 content-center ml-2 flex items-center justify-center`}
                    onClick={nextMonth}>
                    <MdOutlineArrowForwardIos/>
                </button>
            </div>
            <div className={`calendry-calender`}>
                <div className="grid grid-cols-7">
                    {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(
                        (name, index) => (
                            <div
                                key={index}
                                className={`flex justify-center text-slate-700 font-bold`}
                            >{name}</div>
                        )
                    )}
                </div>
                <div className="grid grid-cols-7">
                    {monthCalendar
                        .map((day, index) => {
                            const formattedDate = `${day.date.year}-${String(day.date.month).padStart(2, '0')}-${String(day.date.day).padStart(2, '0')}`;

                            const hasEvent = eventData.find(event => event.date === formattedDate);
                            const activeEvent = hasEvent ? new Date(hasEvent.date) > Date.now() ? true : false : '';


                            return (
                                <Fragment key={index}>
                                    <div
                                        className={`text-center content-center flex justify-center p-1 `}>
                                        {day.isInMonth
                                            ? <button
                                                disabled={`${activeEvent ? '' : 'disabled'}`}
                                                onClick={hasEvent ? () => handleClick(formattedDate) : null}
                                                className={`${formattedDate === activeDay ? "bg-blue-700 text-white" : activeEvent ? "text-slate-800" : ""} ${activeEvent ? "bg-blue-200 hover:bg-blue-700 font-bold hover:text-white hover:transition-all hover:ease-in-out" : "text-gray-400"} ${smallLayout ? "w-9 h-9" : "w-10 h-10"} rounded-full content-center relative`}>
                                                {day.date.day}
                                                {currentDay === day.date.dayOfYear &&
                                                    <div
                                                        className={`rounded-full active-day w-1.5 h-1.5 bg-sky-700 absolute left-4 ${smallLayout ? '' : "ml-0.5"} bottom-0.5 mb-0.5`}></div>}
                                            </button>
                                            : ""}
                                    </div>
                                </Fragment>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}