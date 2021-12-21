import IconButton from "components/Button/IconButton";
import React from "react";

function InboxMessage() {
  return (
    <a
      className="
    cursor-pointer
    hover:before:bg-transparent
    hover:after:bg-transparent
    before:block
    before:w-full
    before:h-[1px]
    before:bg-neutral-200
    last:after:block
    last:after:w-full
    last:after:h-[1px]
    last:after:bg-neutral-200"
    >
      <div className="flex items-center justify-between px-3 hover:bg-cyan-50 py-5 rounded-xl border-l-2 border-transparent hover:border-cyan-800 overflow-hidden group">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full overflow-hidden mr-4">
            <img
              src="https://picsum.photos/100"
              className="h-full w-full"
              alt="img"
            />
          </div>
          <div>
            <div className="flex items-center">
              <p className="font-body text-sm mr-2">Get started in 4 steps</p>
              <span className="text-xs text-neutral-500">4h</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap text-ellipsis max-w-3xl text-xs text-neutral-500">
              <small className="text-xs text-neutral-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Delectus quo autem assumenda ullam natus? Fugit aliquid,
                voluptate dolores blanditiis voluptatem non dicta velit veniam
                minima quisquam quos quaerat neque molestiae doloremque itaque
                incidunt cupiditate beatae natus perferendis? Esse saepe, quos
                recusandae beatae officia placeat aperiam eos. Nam libero nobis
                fugit qui repellendus eum. Atque quisquam eius officia quia
                consectetur! Corporis dolorum in corrupti dolor? Ut accusantium
                illo iste est dolorum voluptates dolor animi ratione, minus
                fugiat repudiandae quae, sunt quasi esse, tenetur facilis
                perspiciatis temporibus corrupti nisi provident praesentium a!
                Quasi, repellat magnam? Exercitationem, ad. Facere nisi quam
                quod autem!
              </small>
            </div>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100">
          <IconButton />
        </div>
      </div>
    </a>
  );
}

export default InboxMessage;
