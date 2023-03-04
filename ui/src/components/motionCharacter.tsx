import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const characterAnimation = {
    hidden: {
        opacity: 0,
        y: `0.25em`,
    },
    visible: {
        opacity: 1,
        y: `0em`,
        transition: {
            ease: "easeOut",
            duration: 1,
        },
    },
};

export default function MotionCharacter(props: { text: string, key: string }) {

    const ref = useRef(null)
    const isInView = useInView(ref)

    return <>
        <motion.span ref={ref} key={props.key} variants={characterAnimation} exit='hidden' animate={isInView ? 'visible' : 'hidden'} initial='hidden'>{props.text}</motion.span>
    </>
}