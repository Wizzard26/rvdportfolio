import {useState} from "react";

export default function CallForm({smallLayout, activeEvent, activeTime, handleSubmit}) {
    const [addEmails, setAddEmails] = useState(false);

    const [name, setName] = useState('');
    const [mail, setMail] = useState('')
    const [guests, setGuests] = useState('');
    const [infos, setInfos] = useState('');

    const handleMailsAdd = () => {
        setAddEmails(true);
    }

    const onSubmit = (e) => {


        handleSubmit(e, {
            name,
            mail,
            guests,
            infos,
            date: activeEvent,
            startTime: activeTime
        })
    }


    return (
        <div className={`cal-form ${smallLayout ? "w-[100%]" : "w-[65%]"} pl-2 pr-2 mx-auto`}>
            <h3 className={'text-slate-700 font-bold mt-5 mb-3'}>Enter Details</h3>
            <form className={'flex flex-col'} onSubmit={onSubmit}>
                <label className={'font-bold text-slate-700 mb-1'}>Name:</label>
                <input
                    className={'border border-slate-400 rounded-md pb-1.5 pt-1.5 mb-5 pl-2 pr-2 text-slate-700 bg-transparent focus:bg-white focus:border-sky-700 focus:outline-none'}
                    type={"text"}
                    name={'name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <label className={'font-bold text-slate-700 mb-1'}>E-Mail:</label>
                <input
                    className={'border border-slate-400 rounded-md pb-1.5 pt-1.5 mb-5 pl-2 pr-2 text-slate-700 bg-transparent focus:bg-white focus:border-sky-700 focus:outline-none'}
                    type={"email"}
                    name={'email'}
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                />
                {addEmails
                    ? <>
                        <label className={'font-bold text-slate-700 mb-1'}>Guest Email(s):</label>
                        <textarea
                            className={'border border-slate-400 rounded-md pb-1 pt-1 pl-2 pr-2 text-slate-700 bg-transparent focus:bg-white focus:border-sky-700 focus:outline-none min-h-24'}
                            name={'guestmails'}
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                        />
                        <div className={`text-xs mb-5 text-gray-500`}>Please separate guest emails with commas</div>
                    </>
                    : <div className={'mb-4'}>
                        <button type={"button"} onClick={handleMailsAdd}
                                className={'border border-sky-700 rounded-full text-sky-700 text-sm pt-1 pb-1 pl-4 pr-4 hover:bg-sky-700 hover:text-white'}>Add
                            Guests
                        </button>
                    </div>
                }
                <label className={'font-bold text-slate-700 mb-1'}>Termin Infos:</label>
                <textarea
                    className={'border border-slate-400 rounded-md pb-1 pt-1 pl-2 pr-2 text-slate-700 bg-transparent focus:bg-white focus:border-sky-700 focus:outline-none min-h-24'}
                    name={'fulltext'}
                    value={infos}
                    onChange={(e) => setInfos(e.target.value)}
                />
                <div className={`text-xs mb-5 text-gray-500`}>Information that would be important for the telephone appointment</div>
                <div className={`flex justify-end`}>
                    <button className={'bg-sky-700 text-white hover:bg-sky-600 pt-1-5 pb-1-5 pl-4 pr-4 rounded-md'}>Send
                        Data
                    </button>
                </div>
            </form>
        </div>
    )
}