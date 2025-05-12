import {Fragment} from "react";


export default function CallTimes({dataEvents, activeEvent, activeTime, handleTimeSet, handleNextData, xSmallLayout, smallLayout}) {
    const eventData = dataEvents;
    const activeDay = new Date(activeEvent);
    const selectedEvent = eventData.find(event => event.date === activeEvent);

    const dateFormated = activeDay.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "short"
    });

    console.log('Events in TimeSheet: ',eventData.find(event => event.date === activeEvent))


    return(
        <div className={`timeTable flex flex-col gap-1.5 ml-2 mr-2 ${xSmallLayout ? "w-[100%]" : "w-48"}`}>
            <h3 className="mb-5 mt-7 text-gray-800">{dateFormated}</h3>
            {selectedEvent.timeslots
                .filter((times) => (times.active === true))
                .map((times, index) => {
                return (
                    <Fragment key={index}>
                        <div className="flex time-spot gap-2 transition-all ease-in-out">
                            <button
                                onClick={() => handleTimeSet(times.startTime)}
                                disabled={activeTime === times.startTime ? "disabled" : undefined}
                                className={`flex-auto border border-blue-500 pt-2 pb-2 mb-2 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white transition-all disabled:bg-gray-400 disabled:border-gray-400 disabled:text-white`}>
                                {times.startTime}
                            </button>
                            {activeTime === times.startTime &&
                                <button
                                    onClick={() => handleNextData(times.startTime)}
                                    className={`flex-auto border border-blue-500 pt-2 pb-2 mb-2 text-white bg-blue-500 hover:bg-blue-700 hover:text-white transition-all duration-500`}>Next
                                </button>
                            }
                        </div>
                    </Fragment>
                )
            })}
        </div>
    )
}