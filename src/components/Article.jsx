import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { updateVotes, fetchSingleArticle } from "../utils/api";
import Comments from "./Comments";
import Error from "./Error";
import { displayDate } from "../utils/formatDate";
import Loading from "./Loading";
import Modal from "./Modal";

const Article = ({ loggedInUser, setLoggedInUser }) => {
  const [singleArticle, setSingleArticle] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { article_id } = useParams();

  useEffect(() => {
    setIsLoading(true);
    fetchSingleArticle(article_id)
      .then(({ article }) => {
        setSingleArticle(article);
        setIsLoading(false);
        setError(null);
      })
      .catch(
        ({
          response: {
            data: { msg },
            status,
          },
        }) => {
          setError({ msg, status });
          setIsLoading(true);
        }
      );
  }, []);

  const voteButtonHandler = (vote) => {
    if (singleArticle.voted !== vote) {
      let modifyVoteBy;
      if (
        (singleArticle.voted === -1 && vote === 1) ||
        (singleArticle.voted === 1 && vote === -1)
      ) {
        modifyVoteBy = vote * 2;
      } else {
        modifyVoteBy = vote;
      }

      setSingleArticle({
        ...singleArticle,
        votes: singleArticle.votes + modifyVoteBy,
      });

      updateVotes(modifyVoteBy, singleArticle.article_id)
        .then(({ updatedArticle }) => {
          setSingleArticle({
            ...singleArticle,
            ...updatedArticle,
            voted: vote,
          });
        })
        .catch((err) => {
          setSingleArticle({
            ...singleArticle,
            votes: singleArticle.votes,
          });
          alert("something went wrong");
        });
    } else {
      setSingleArticle({
        ...singleArticle,
        votes: singleArticle.votes - vote,
        voted: singleArticle.voted - vote,
      });

      updateVotes(-vote, singleArticle.article_id)
        .then(({ updatedArticle }) => {
          setSingleArticle({
            ...singleArticle,
            ...updatedArticle,
            voted: 0,
          });
        })
        .catch((err) => {
          setSingleArticle({
            ...singleArticle,
            votes: singleArticle.votes,
          });
          alert("something went wrong");
        });
    }
  };

  if (openModal)
    return (
      <Modal setLoggedInUser={setLoggedInUser} setOpenModal={setOpenModal} />
    );
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <>
      <div className="yellow-bg-border">
        <h1 className="text-bold uppercase">{singleArticle.topic}</h1>
      </div>
      <div className="container">
        <div className="text-center pt-2">
          <Link to="/articles">
            <button className="btn-dark article-page-btn">
              Back to all articles
            </button>
          </Link>
          <Link to={`/articles/topics/${singleArticle.topic}`}>
            <button className="btn-dark article-page-btn ">
              Back to {singleArticle.topic} articles
            </button>
          </Link>
        </div>

        <article className="card">
          <h1>{singleArticle.title}</h1>
          <p>{singleArticle.body}</p>
          <p>
            Written by: <b>{singleArticle.author}</b>
          </p>
          <p>Posted on: {displayDate(singleArticle.created_at)}</p>
          {!loggedInUser ? <p>{singleArticle.votes} votes</p> : null}
          <p>{singleArticle.comment_count} Comments</p>
          {loggedInUser ? (
            <div>
              <div className="d-flex">
                <button
                  aria-label="Up vote button"
                  className={
                    singleArticle.voted === 1 ? "btn-dark active" : "btn-dark"
                  }
                  onClick={() => {
                    voteButtonHandler(1);
                  }}
                >
                  <i className="arrow up"></i>
                </button>
                <p>Up vote article</p>
              </div>

              <p>{singleArticle.votes} votes</p>
              <div className="d-flex">
                <button
                  aria-label="Down vote button"
                  className={
                    singleArticle.voted === -1 ? "btn-dark active" : "btn-dark"
                  }
                  onClick={() => {
                    voteButtonHandler(-1);
                  }}
                >
                  <i className="arrow down"></i>
                </button>
                <p>Down vote article</p>
              </div>
            </div>
          ) : null}
        </article>
        {!loggedInUser ? (
          <h2 className="text-center ">
            Please{" "}
            <Link
              className="text-decoration-none"
              onClick={() => setOpenModal(true)}
            >
              login{" "}
            </Link>
            to vote and comment
          </h2>
        ) : null}
        <div className="comment-container">
          <Comments loggedInUser={loggedInUser} />
        </div>
      </div>
    </>
  );
};

export default Article;
