
// import { Stars } from "@react-three/drei";
// import { Canvas } from "@react-three/fiber";
import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import {
    useMotionTemplate,
    useMotionValue,
    motion,
    animate,
} from "framer-motion";
import { useNavigate } from "react-router-dom";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export const AuroraHero = () => {
    const color = useMotionValue(COLORS_TOP[0]);
    const navigate = useNavigate();

    useEffect(() => {
        animate(color, COLORS_TOP, {
            ease: "easeInOut",
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
        });
    }, []);

    const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
    const border = useMotionTemplate`1px solid ${color}`;
    const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

    const handleStartTrial = () => {
        navigate('/dashboard');
    };

    return (
        <motion.section
            style={{
                backgroundImage,
            }}
            className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
        >
            {/* Data/Grid Background Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                {/* Radial Gradient for focus */}
                <div className="absolute inset-0 bg-gray-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            </div>

            {/* Image Layer (Behind Text) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 z-0 flex items-center justify-center opacity-60 pointer-events-none mt-20 sm:mt-0"
            >
                <div className="relative w-full max-w-[90rem] aspect-video">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950 z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-transparent to-gray-950 z-10"></div>
                    <img
                        src="/assets/hero_devices_v2.png"
                        alt="Ainance Dashboard"
                        className="w-full h-full object-contain object-center opacity-80"
                    />
                </div>
            </motion.div>

            {/* Content Layer (On Top) */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-20">
                <span className="mb-4 inline-block rounded-full bg-gray-900/80 border border-gray-800 backdrop-blur-md px-4 py-1.5 text-sm text-gray-300 shadow-lg">
                    AI-POWERED ACCOUNTING
                </span>
                <h1 className="max-w-4xl bg-gradient-to-br from-white via-white to-gray-400 bg-clip-text text-center text-5xl font-bold leading-tight text-transparent sm:text-7xl sm:leading-tight md:text-8xl md:leading-tight tracking-tighter drop-shadow-sm">
                    Finance, Simplified.
                </h1>
                <p className="my-8 max-w-2xl text-center text-lg leading-relaxed text-gray-300 md:text-xl md:leading-relaxed drop-shadow-md">
                    AIが経理業務を自動化し、事業者の成長をサポート。
                    <br />
                    複雑な数値を、経営の力に変える。
                </p>
                <motion.button
                    style={{
                        border,
                        boxShadow,
                    }}
                    whileHover={{
                        scale: 1.05,
                    }}
                    whileTap={{
                        scale: 0.95,
                    }}
                    onClick={handleStartTrial}
                    className="group relative flex w-fit items-center gap-2 rounded-full bg-white text-black px-8 py-4 font-bold text-lg transition-all hover:bg-gray-100 cursor-pointer shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
                >
                    無料トライアルを始める
                    <ArrowRight className="transition-transform group-hover:translate-x-1 w-5 h-5" />
                </motion.button>
            </div>

            {/* 3D Elements Placeholder */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* <Canvas>
                    <Stars radius={50} count={2500} factor={4} fade speed={2} />
                </Canvas> */}
            </div>
        </motion.section>
    );
};
