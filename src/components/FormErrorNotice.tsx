"use client";

/**
 * Shown when a form submission does not go through.
 *
 * It never pretends the submission succeeded, and it always leaves the visitor
 * a working way to reach us: a one-click email fallback that opens their mail
 * client with the same details pre-filled, plus the phone number. That covers
 * every failure case — offline, blocked third-party request, service outage,
 * or a Formsubmit form that has not been activated yet.
 */
export default function FormErrorNotice({
  message,
  onEmailFallback,
}: {
  message: string;
  onEmailFallback: () => void;
}) {
  return (
    <div
      role="alert"
      className="mt-6 rounded-2xl border-l-[5px] border-[#B3261E] bg-[#FDECEA] p-6"
    >
      <h4 className="text-lg font-extrabold text-[#8C1D18]">
        We could not send that automatically
      </h4>
      <p className="mt-2 text-base leading-relaxed text-[#5F1512]">
        {message} Nothing you typed has been lost — you can send it by email
        instead, and it will reach exactly the same inbox.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onEmailFallback}
          className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-light"
        >
          Send by email instead
        </button>
        <p className="text-sm leading-relaxed text-[#5F1512]">
          or call{" "}
          <a href="tel:+18884976620" className="font-bold underline">
            888-497-6620
          </a>
        </p>
      </div>
    </div>
  );
}
