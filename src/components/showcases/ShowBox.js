import {roboto} from "@/app/fonts";

export default function ShowBox({headline,data, boxClass = 'web', category = ''}) {
    const caseEntries = data.filter((entry) => entry.category === category);

    return (
        <>
            <h2 className={`${roboto.className} is--centered`}>{headline}</h2>
            <div className={`row`}>

                {caseEntries.map((entry) => (
                    <div key={entry.id} className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2`}>
                        <div className={`card card-cases`}>
                            <div className={`card-image card-image-${boxClass}`}>
                                <img src={`/img/casestudy/${entry.imgPath}/${entry.image}`}
                                     alt={entry.title} width={900}
                                     height={900}/>
                            </div>
                            <div className={`card-content`}>
                                <h3 className={roboto.className}>{entry.title}</h3>
                                <p>{entry.description}</p>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </>
    )

}