import MessageHeader from "components/DirectMessage/Header";
import { useAppSelector } from "hooks/useAppSelector";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Member } from "types";

type Props = {};

const MessagePage = ({}: Props) => {
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);

  const memberData: Member = useMemo(() => {
    return member.members?.find((item) => item._id === params?.userId);
  }, [member.members, params?.userId]);

  if (!memberData) return <></>;

  return (
    <div className="w-full h-screen flex flex-col min-h-0">
      <MessageHeader data={memberData} />

      <div className="flex-grow overflow-auto min-h-0">
        <p className="text-6xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla vitae
          maxime tenetur dolorem magni labore voluptate iste repellat in quasi.
          Voluptate minima magni, similique autem dicta beatae quidem at
          assumenda quis. Ullam nesciunt earum recusandae autem eius. Totam
          doloribus dolores consequatur cupiditate autem? Voluptas saepe,
          perferendis quis architecto aut recusandae veritatis aperiam ut fuga,
          distinctio sequi, aliquid soluta odit totam quos! Aut quam vitae
          nesciunt error, doloremque reprehenderit, vel impedit ipsum omnis
          temporibus, repellendus amet deserunt animi deleniti ullam nisi? Eos,
          numquam. Adipisci error in, quam molestiae ipsum cumque consequatur
          ducimus ad illo. Autem ipsam eius dolores at nostrum accusamus eum
          quam aspernatur velit nemo odit est veritatis, ducimus, facere aut
          culpa expedita blanditiis atque reiciendis, corrupti aliquid in sint
          alias delectus? Pariatur, quibusdam nesciunt animi ullam nulla vel, ex
          explicabo, eius quos molestias labore dignissimos vero alias
          consequuntur modi eveniet nostrum quo accusamus enim esse! Inventore
          possimus cum asperiores! Neque dolor excepturi corporis tempore alias?
          Quidem, hic accusamus? Aspernatur commodi quo, qui voluptas officiis
          sequi eos placeat rem distinctio voluptate error, tempore, provident
          sed fugiat dolore ratione iusto harum ad. Animi nobis doloremque
          corporis earum quas ab blanditiis consequatur praesentium non illo
          nihil voluptas voluptatem similique ullam dignissimos illum, ipsam
          quisquam aliquid sapiente tenetur est minima? Nemo omnis enim
          molestias debitis nesciunt quibusdam repudiandae officia veniam
          commodi tempora ab aut architecto eius laudantium, aspernatur
          temporibus. Sint beatae debitis accusantium repudiandae veritatis
          magni repellat quod autem ut quia quidem mollitia praesentium,
          quisquam, numquam doloribus consequatur odio! Ex nemo voluptatem quia
          nesciunt, doloribus rem. Quas sit nesciunt mollitia quasi, ut dolorum.
          Ipsa fugiat corrupti, aliquam ut quasi eos. Maxime consectetur tempore
          ipsam minima in optio unde earum est atque, quidem similique quisquam,
          suscipit dicta! Maxime ipsam aperiam debitis, blanditiis nesciunt,
          atque quaerat esse eaque mollitia aut quos magnam a! Similique beatae
          perferendis magnam? In itaque animi vero mollitia minus, ab pariatur
          eius nam exercitationem delectus repellendus? Distinctio
          necessitatibus consequuntur voluptates molestiae, dolorum, nulla
          aspernatur corrupti fuga veniam laudantium, deleniti odio accusamus
          cupiditate blanditiis beatae dignissimos? Illo aperiam rem nam impedit
          voluptate molestias. Molestiae cum eum provident error ea voluptate
          unde iure officiis, voluptas, laudantium illo at non numquam sed
          eaque. Quas voluptatum consequuntur a odio aliquam tempore praesentium
          quis error repudiandae repellat magnam, explicabo delectus. Iusto
          consequatur neque aspernatur distinctio voluptas ab illo, quo sapiente
          tempora nisi quidem blanditiis ad odio dolores dolorem ducimus
          laborum. Eligendi illo fugiat ut libero ipsum. Minima porro ea nostrum
          dignissimos? Labore, iusto, vel pariatur doloribus enim cum iste
          itaque natus aliquid alias quia fugiat. Perferendis beatae in, aperiam
          maiores omnis dolor debitis eos repellendus alias distinctio expedita
          labore ab soluta vel! Dolore illo quas aliquam similique beatae et
          quae labore aspernatur nemo consequatur. Blanditiis sit sed molestiae,
          dolorum ipsum incidunt iste illum sapiente eaque? Esse, ipsum culpa
          numquam rerum, sit ad aperiam beatae rem architecto amet velit quasi
          et fugiat sunt! Recusandae molestiae vero placeat exercitationem
          maiores quae corporis ea debitis, architecto omnis, possimus
          voluptatem eaque aliquam quod! Ipsa unde laboriosam tenetur nisi. Quas
          harum porro praesentium vel, nulla autem ex excepturi aspernatur ab
          molestias. Aliquam officia aliquid aspernatur similique consequatur
          eaque, eius aperiam eveniet dignissimos neque et sequi quia!
          Repellendus quod tempore magnam et ab, at pariatur accusamus a
          molestiae obcaecati voluptate quas sequi totam facilis libero culpa
          deserunt laudantium soluta nemo non explicabo quasi officia unde
          voluptatum? Odio nesciunt laboriosam ducimus voluptates consequuntur
          hic dolor similique commodi suscipit minima voluptatem cupiditate quas
          quos veritatis optio reprehenderit recusandae iure, nobis aut at quam
          eos doloremque facilis deserunt. Numquam voluptates expedita animi
          voluptatibus tempore dolore vitae esse illum dignissimos laboriosam
          qui temporibus, alias aliquam odio laborum harum quod. Obcaecati error
          quidem quis dicta ex quae, amet quod dolorem maiores odit, perferendis
          asperiores suscipit inventore quo, voluptas necessitatibus vel! Esse,
          reprehenderit et est deserunt quos sequi nesciunt numquam provident
          quaerat magni libero! Ipsum velit quisquam voluptates, accusamus in
          itaque beatae, earum sunt consectetur impedit odio. Assumenda nobis
          quidem voluptatibus temporibus repudiandae eaque. Modi incidunt
          consectetur molestiae? Consequuntur quam quasi dolor, laudantium
          excepturi accusamus necessitatibus nemo sunt facere eaque qui fuga,
          aut laboriosam quae velit corporis ut harum similique praesentium
          quibusdam placeat maxime? Dolor, tempore consectetur sequi sint
          possimus deserunt magnam ipsa. Nihil tenetur asperiores nostrum alias
          praesentium pariatur placeat sequi nulla maxime fugit? Consequatur
          nemo magnam eos quas fuga mollitia incidunt, neque voluptatibus et ea
          voluptate dicta excepturi velit atque laboriosam earum laudantium
          quasi accusamus adipisci facilis! Modi vitae omnis eveniet earum saepe
          quia facilis laborum culpa officia neque laboriosam quasi placeat
          quaerat, iusto ratione eaque dolorem optio maxime assumenda est,
          deleniti consequuntur mollitia? Facilis consequuntur natus officiis
          voluptas adipisci iste excepturi, sit deleniti. Recusandae iusto
          reiciendis quidem provident odit, quaerat est, nulla exercitationem
          explicabo sunt sapiente dolores, a quo labore maiores at. Ipsum, quia.
          Et itaque magnam doloremque, error, voluptas inventore sint enim
          asperiores amet ipsam facere quos eos harum animi. Ratione harum
          voluptate, in iusto natus, porro magni consequuntur quibusdam fuga
          vero facere nesciunt alias dolore libero deleniti ducimus
          necessitatibus velit deserunt reprehenderit tempore voluptates? Optio
          voluptatem rem error libero distinctio earum, hic veniam modi officiis
          nemo vel dolorum, pariatur maxime magnam! Distinctio delectus eveniet
          placeat libero illum hic asperiores temporibus ipsa fuga vitae natus
          totam nostrum sit nobis sequi laborum magni, dolorum aliquid accusamus
          dignissimos, omnis, quod assumenda excepturi quidem. Cumque, et minus!
          Deleniti minus consequatur, ipsa ullam maiores facilis consequuntur
          modi? Ut officiis nisi ea quo temporibus, placeat doloremque rem culpa
          qui at fugiat voluptatum deleniti, doloribus necessitatibus
          praesentium modi eius nihil sit porro, quia voluptates! Consectetur
          cupiditate maiores tenetur suscipit ipsum itaque deleniti, ipsam
          tempora nisi facilis, consequatur aspernatur voluptate dolor
          blanditiis eveniet placeat iste quidem corporis. Corrupti quo
          obcaecati cum illum nihil dolorem reiciendis blanditiis, officia
          tenetur quis suscipit fuga vel error natus saepe animi sunt numquam
          voluptatem. Hic alias facere similique asperiores soluta tempora iste
          deleniti nam dolorum amet? Ex illo veniam voluptas sint unde nulla
          dicta. Autem, cupiditate, corporis voluptatibus facere explicabo modi
          dignissimos dolor eligendi eum quisquam voluptas deleniti iusto
          accusantium similique veniam libero soluta maxime id!
        </p>
      </div>

      <div className="sticky top-0 bg-red-300 ">
        <textarea />
      </div>
    </div>
  );
};

export default MessagePage;
