import React, { useState } from 'react';
import { CDL_POLICY_QUESTIONS, PolicyQuizQuestion, CDLSubLevel } from '../types/cdlPolicy';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';
import { FileQuestion, CheckCircle2, XCircle, ArrowRight, Award, RotateCcw } from 'lucide-react';

interface PolicyQuizModalProps {
  currentTier: CDLSubLevel;
  onQuizCompleted: (scoreEarned: number, correctCount: number) => void;
  onClose: () => void;
}

export const PolicyQuizModal: React.FC<PolicyQuizModalProps> = ({
  currentTier,
  onQuizCompleted,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctTotal, setCorrectTotal] = useState(0);
  const [totalScoreAccrued, setTotalScoreAccrued] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const question: PolicyQuizQuestion = CDL_POLICY_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);

    const isCorrect = selectedOption === question.correctAnswer;
    if (isCorrect) {
      soundManager.playQuizCorrect();
      setCorrectTotal((prev) => prev + 1);
      setTotalScoreAccrued((prev) => prev + 300);
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.6 },
      });
    } else {
      soundManager.playQuizWrong();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < CDL_POLICY_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      onQuizCompleted(totalScoreAccrued, correctTotal);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectTotal(0);
    setTotalScoreAccrued(0);
    setQuizFinished(false);
  };

  return (
    <div className="modal-layer">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-2xl w-full max-w-xl modal-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <FileQuestion className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm sm:text-base">
                CDL Policy &amp; Tiering Exam Challenge
              </h3>
              <p className="text-[11px] text-neutral-400">
                Official Q&amp;A from the CDL New Policy (August 2026)
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">CDL Standing</div>
            <div className="text-xs font-black text-emerald-400 font-mono">{currentTier}</div>
          </div>
        </div>

        {/* Content */}
        {!quizFinished ? (
          <div className="p-3 sm:p-4 overflow-y-auto space-y-4 modal-card-body">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">
                Question <strong className="text-white">{currentIndex + 1}</strong> of{' '}
                {CDL_POLICY_QUESTIONS.length}
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                Score: +{totalScoreAccrued} PTS ({correctTotal} Correct)
              </span>
            </div>

            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / CDL_POLICY_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 block">
                Source: {question.sourceDoc}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {question.question}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {question.options.map((optText, idx) => {
                const isSelected = selectedOption === idx;
                let optClass = 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-200';

                if (isSelected) {
                  optClass = 'bg-emerald-950/40 border-emerald-400 text-white ring-1 ring-emerald-400';
                }

                if (isAnswered) {
                  if (idx === question.correctAnswer) {
                    optClass = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400';
                  } else if (isSelected && idx !== question.correctAnswer) {
                    optClass = 'bg-rose-950/70 border-rose-500 text-rose-200 ring-2 ring-rose-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-3 ${optClass}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-emerald-400 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 font-medium">{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div
                className={`p-3 rounded-xl border text-xs animate-in fade-in duration-200 ${
                  selectedOption === question.correctAnswer
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {selectedOption === question.correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>EXCELLENT! +300 PTS EARNED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>INCORRECT! NO POINTS AWARDED</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed text-neutral-300">{question.explanation}</p>
              </div>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto text-emerald-400">
              <Award className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-black uppercase text-white">Policy Exam Complete!</h4>
            <p className="text-xs text-neutral-300 max-w-sm mx-auto">
              You scored <strong className="text-emerald-400">{correctTotal} out of {CDL_POLICY_QUESTIONS.length}</strong> correct on official CDL tiering metrics and compliance standards.
            </p>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 max-w-xs mx-auto">
              <div className="text-xs text-neutral-400 uppercase font-bold">Total Policy Points</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                +{totalScoreAccrued} PTS
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={handleRestart}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retake Exam
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black cursor-pointer shadow-md"
              >
                Apply Knowledge In Game
              </button>
            </div>
          </div>
        )}

        {/* Footer controls when in progress */}
        {!quizFinished && (
          <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs cursor-pointer"
            >
              Exit Exam
            </button>
            {!isAnswered ? (
              <button
                disabled={selectedOption === null}
                onClick={handleCheckAnswer}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-black text-xs cursor-pointer shadow-md transition-all"
              >
                SUBMIT ANSWER
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1 transition-all"
              >
                {currentIndex + 1 < CDL_POLICY_QUESTIONS.length ? 'NEXT QUESTION' : 'VIEW EXAM SUMMARY'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
